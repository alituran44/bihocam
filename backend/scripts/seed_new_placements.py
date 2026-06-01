import sqlite3
import uuid
from datetime import datetime

def seed():
    conn = sqlite3.connect('bihocam.db')
    cursor = conn.cursor()
    
    # Get Admin User
    cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    admin = cursor.fetchone()
    if not admin:
        print("Error: No admin user found in database! Pricing cannot be seeded.")
        conn.close()
        return
    
    admin_id = admin[0]
    print(f"Using Admin ID: {admin_id}")
    
    now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    
    placements_to_seed = [
        {
            "code": "become_instructor_banner",
            "name": "Eğitmen Ol Sayfası Banner",
            "description": "Eğitmen başvuru sayfasında üst kısımda görünen banner reklam alanı",
            "placement_type": "banner",
            "location": "Eğitmen Ol Sayfası",
            "width": 1200,
            "height": 250,
            "max_ads": 1,
            "priority": 90,
            "pricing": [
                {
                    "pricing_model": "fixed_daily",
                    "price_per_day": 90.00,
                    "min_daily_budget": 45.00,
                    "max_daily_budget": 450.00
                },
                {
                    "pricing_model": "per_impression",
                    "price_per_impression": 0.030,
                    "min_daily_budget": 10.00,
                    "max_daily_budget": 1000.00
                },
                {
                    "pricing_model": "per_click",
                    "price_per_click": 1.80,
                    "min_daily_budget": 20.00,
                    "max_daily_budget": 2000.00
                }
            ]
        },
        {
            "code": "teachers_banner",
            "name": "Eğitmenler Sayfası Banner",
            "description": "Eğitmen listeleme sayfasında üst kısımda görünen banner reklam alanı",
            "placement_type": "banner",
            "location": "Eğitmenler Sayfası",
            "width": 1200,
            "height": 250,
            "max_ads": 1,
            "priority": 85,
            "pricing": [
                {
                    "pricing_model": "fixed_daily",
                    "price_per_day": 85.00,
                    "min_daily_budget": 42.50,
                    "max_daily_budget": 425.00
                },
                {
                    "pricing_model": "per_impression",
                    "price_per_impression": 0.028,
                    "min_daily_budget": 10.00,
                    "max_daily_budget": 1000.00
                },
                {
                    "pricing_model": "per_click",
                    "price_per_click": 1.70,
                    "min_daily_budget": 20.00,
                    "max_daily_budget": 2000.00
                }
            ]
        }
    ]
    
    for item in placements_to_seed:
        # Check if placement exists
        cursor.execute("SELECT id FROM ad_placements WHERE code = ?", (item["code"],))
        existing_placement = cursor.fetchone()
        
        if existing_placement:
            placement_id = existing_placement[0]
            print(f"Placement '{item['name']}' ({item['code']}) already exists. Skipping insertion, checking pricing...")
        else:
            placement_id = str(uuid.uuid4()).replace("-", "")
            cursor.execute(
                """
                INSERT INTO ad_placements (id, name, code, description, placement_type, location, width, height, max_ads, is_active, priority, targeting_options)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    placement_id,
                    item["name"],
                    item["code"],
                    item["description"],
                    item["placement_type"],
                    item["location"],
                    item["width"],
                    item["height"],
                    item["max_ads"],
                    1, # is_active
                    item["priority"],
                    None # targeting_options
                )
            )
            print(f"Created placement: '{item['name']}' with ID: {placement_id}")
            
        # Seed or check pricing
        for pr in item["pricing"]:
            cursor.execute(
                "SELECT id FROM ad_pricing WHERE placement_id = ? AND pricing_model = ?",
                (placement_id, pr["pricing_model"])
            )
            existing_pricing = cursor.fetchone()
            
            if existing_pricing:
                print(f"  Pricing model '{pr['pricing_model']}' already exists. Updating price values...")
                cursor.execute(
                    """
                    UPDATE ad_pricing 
                    SET price_per_day = ?, price_per_impression = ?, price_per_click = ?, min_daily_budget = ?, max_daily_budget = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        pr.get("price_per_day"),
                        pr.get("price_per_impression"),
                        pr.get("price_per_click"),
                        pr.get("min_daily_budget"),
                        pr.get("max_daily_budget"),
                        now_str,
                        existing_pricing[0]
                    )
                )
            else:
                pricing_id = str(uuid.uuid4()).replace("-", "")
                cursor.execute(
                    """
                    INSERT INTO ad_pricing (id, placement_id, pricing_model, price_per_day, price_per_impression, price_per_click, min_daily_budget, max_daily_budget, min_campaign_duration_days, max_campaign_duration_days, discount_percentage, is_active, effective_from, created_by_id, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        pricing_id,
                        placement_id,
                        pr["pricing_model"],
                        pr.get("price_per_day"),
                        pr.get("price_per_impression"),
                        pr.get("price_per_click"),
                        pr.get("min_daily_budget"),
                        pr.get("max_daily_budget"),
                        1, # min_campaign_duration_days
                        90, # max_campaign_duration_days
                        0.00, # discount_percentage
                        1, # is_active
                        now_str, # effective_from
                        admin_id,
                        now_str,
                        now_str
                    )
                )
                print(f"  Created pricing model: '{pr['pricing_model']}' with ID: {pricing_id}")
                
    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
