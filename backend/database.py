import os
import datetime
import json
import pandas as pd
from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "mastitis_ai.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AnimalModel(Base):
    __tablename__ = "animals"

    animal_id = Column(String, primary_key=True, index=True)
    record_id = Column(String, index=True)
    farm_id = Column(String, index=True)
    breed = Column(String)
    age_years = Column(Float)
    lactation_number = Column(Integer)
    days_in_milk = Column(Integer)
    previous_mastitis = Column(Integer)
    disease_history = Column(String)
    vaccination_status = Column(String)
    treatment_history = Column(String, nullable=True)
    
    # Milk measurements
    milk_yield_l_day = Column(Float)
    scc_cells_ml = Column(Integer)
    milk_conductivity_ms_cm = Column(Float, nullable=True)
    milk_temperature_c = Column(Float)
    
    # Animal sensors
    body_temperature_c = Column(Float, nullable=True)
    udder_surface_temperature_c = Column(Float, nullable=True)
    activity_percent = Column(Float, nullable=True)
    rumination_min_day = Column(Float, nullable=True)
    feeding_behavior_score = Column(Float)
    water_intake_l_day = Column(Float)
    
    # Farm management
    feed_quality_score = Column(Float, nullable=True)
    hygiene_score = Column(Float)
    housing_condition_score = Column(Float)
    milking_hygiene_score = Column(Float)
    worker_hygiene_score = Column(Float, nullable=True)
    milking_frequency_per_day = Column(Integer)
    milking_schedule = Column(String)
    
    # Environment & Health
    ambient_temperature_c = Column(Float)
    relative_humidity_percent = Column(Float)
    climate_risk = Column(String)
    co_morbidity = Column(Integer)
    sensor_status = Column(String)
    
    # Target label from CSV if available
    mastitis_within_7_14_days = Column(Integer, default=0)
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    animal_id = Column(String, index=True)
    risk_score = Column(Float)
    risk_category = Column(String)
    forecast = Column(String, default="7–14 days")
    prediction = Column(Integer)
    probability = Column(Float)
    risk_factors_json = Column(Text)
    recommendations_json = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AlertRecord(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    animal_id = Column(String, index=True)
    farm_id = Column(String, index=True)
    alert_type = Column(String)  # HIGH RISK, MODERATE RISK, SENSOR WARNING, HERD WARNING
    severity = Column(String)    # HIGH, MODERATE, LOW
    title = Column(String)
    message = Column(Text)
    main_indicators_json = Column(Text)
    is_reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SensorObservation(Base):
    __tablename__ = "sensor_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    animal_id = Column(String, index=True)
    readings_json = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SMSNotificationRecord(Base):
    """Stores every simulated or real SMS dispatch attempt."""
    __tablename__ = "sms_notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    animal_id = Column(String, index=True)
    farm_id = Column(String, index=True)
    recipient = Column(String)         # phone number
    message = Column(Text)
    risk_category = Column(String)
    risk_score = Column(Float)
    status = Column(String, default="SENT_SIMULATED")  # SENT_SIMULATED | FAILED
    mode = Column(String, default="SIMULATED")          # SIMULATED | REAL
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)


class SMSSettingsRecord(Base):
    """Single-row persistent table for SMS configuration."""
    __tablename__ = "sms_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    enabled = Column(Boolean, default=False)
    farmer_phone = Column(String, default="")
    vet_phone = Column(String, default="")
    mode = Column(String, default="SIMULATED")   # SIMULATED | REAL

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Creates DB tables and seeds animal records from CSV if DB is empty.
    Also seeds a default SMSSettingsRecord if none exists.
    """
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        count = db.query(AnimalModel).count()
        if count == 0:
            csv_path = os.path.join(os.path.dirname(__file__), "data", "bovine_mastitis_synthetic_10000.csv")
            if os.path.exists(csv_path):
                print(f"Seeding database from CSV: {csv_path}")
                df = pd.read_csv(csv_path)
                
                # Keep latest record per animal_id to ensure unique animal entries
                df_unique = df.drop_duplicates(subset=['animal_id'], keep='last')
                
                animals_to_insert = []
                for _, row in df_unique.iterrows():
                    anim = AnimalModel(
                        animal_id=str(row['animal_id']),
                        record_id=str(row['record_id']),
                        farm_id=str(row['farm_id']),
                        breed=str(row['breed']),
                        age_years=float(row['age_years']) if pd.notnull(row['age_years']) else 0.0,
                        lactation_number=int(row['lactation_number']) if pd.notnull(row['lactation_number']) else 1,
                        days_in_milk=int(row['days_in_milk']) if pd.notnull(row['days_in_milk']) else 0,
                        previous_mastitis=int(row['previous_mastitis']) if pd.notnull(row['previous_mastitis']) else 0,
                        disease_history=str(row['disease_history']) if pd.notnull(row['disease_history']) else 'None',
                        vaccination_status=str(row['vaccination_status']) if pd.notnull(row['vaccination_status']) else 'Up to date',
                        treatment_history=str(row['treatment_history']) if pd.notnull(row['treatment_history']) else None,
                        milk_yield_l_day=float(row['milk_yield_l_day']) if pd.notnull(row['milk_yield_l_day']) else 0.0,
                        scc_cells_ml=int(row['scc_cells_ml']) if pd.notnull(row['scc_cells_ml']) else 0,
                        milk_conductivity_ms_cm=float(row['milk_conductivity_ms_cm']) if pd.notnull(row['milk_conductivity_ms_cm']) else None,
                        milk_temperature_c=float(row['milk_temperature_c']) if pd.notnull(row['milk_temperature_c']) else 0.0,
                        body_temperature_c=float(row['body_temperature_c']) if pd.notnull(row['body_temperature_c']) else None,
                        udder_surface_temperature_c=float(row['udder_surface_temperature_c']) if pd.notnull(row['udder_surface_temperature_c']) else None,
                        activity_percent=float(row['activity_percent']) if pd.notnull(row['activity_percent']) else None,
                        rumination_min_day=float(row['rumination_min_day']) if pd.notnull(row['rumination_min_day']) else None,
                        feeding_behavior_score=float(row['feeding_behavior_score']) if pd.notnull(row['feeding_behavior_score']) else 0.0,
                        water_intake_l_day=float(row['water_intake_l_day']) if pd.notnull(row['water_intake_l_day']) else 0.0,
                        feed_quality_score=float(row['feed_quality_score']) if pd.notnull(row['feed_quality_score']) else None,
                        hygiene_score=float(row['hygiene_score']) if pd.notnull(row['hygiene_score']) else 0.0,
                        housing_condition_score=float(row['housing_condition_score']) if pd.notnull(row['housing_condition_score']) else 0.0,
                        milking_hygiene_score=float(row['milking_hygiene_score']) if pd.notnull(row['milking_hygiene_score']) else 0.0,
                        worker_hygiene_score=float(row['worker_hygiene_score']) if pd.notnull(row['worker_hygiene_score']) else None,
                        milking_frequency_per_day=int(row['milking_frequency_per_day']) if pd.notnull(row['milking_frequency_per_day']) else 2,
                        milking_schedule=str(row['milking_schedule']) if pd.notnull(row['milking_schedule']) else 'Standard',
                        ambient_temperature_c=float(row['ambient_temperature_c']) if pd.notnull(row['ambient_temperature_c']) else 0.0,
                        relative_humidity_percent=float(row['relative_humidity_percent']) if pd.notnull(row['relative_humidity_percent']) else 0.0,
                        climate_risk=str(row['climate_risk']) if pd.notnull(row['climate_risk']) else 'Low',
                        co_morbidity=int(row['co_morbidity']) if pd.notnull(row['co_morbidity']) else 0,
                        sensor_status=str(row['sensor_status']) if pd.notnull(row['sensor_status']) else 'Active',
                        mastitis_within_7_14_days=int(row['mastitis_within_7_14_days']) if pd.notnull(row['mastitis_within_7_14_days']) else 0
                    )
                    animals_to_insert.append(anim)
                
                db.bulk_save_objects(animals_to_insert)
                db.commit()
                print(f"Successfully seeded {len(animals_to_insert)} animals into database.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

    # Seed default SMS settings row if table is empty
    db2 = SessionLocal()
    try:
        if db2.query(SMSSettingsRecord).count() == 0:
            db2.add(SMSSettingsRecord(
                enabled=False,
                farmer_phone="",
                vet_phone="",
                mode="SIMULATED"
            ))
            db2.commit()
            print("Default SMS settings seeded.")
    except Exception as e:
        db2.rollback()
        print(f"Error seeding SMS settings: {e}")
    finally:
        db2.close()
