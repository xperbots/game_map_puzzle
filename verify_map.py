import json
import os

def verify_map_materials():
    file_path = "map_materials/中华人民共和国各省.geojson"
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        features = data.get('features', [])
        print(f"Total features found: {len(features)}")
        
        valid_provinces = []
        for feature in features:
            props = feature.get('properties', {})
            name = props.get('name', 'Unknown')
            adcode = props.get('adcode', 'Unknown')
            geometry = feature.get('geometry')
            
            if geometry and geometry.get('coordinates'):
                valid_provinces.append(f"{name} ({adcode})")
            else:
                print(f"Warning: Invalid geometry for {name}")

        print("\n--- Valid Provinces ---")
        for p in valid_provinces:
            print(p)
            
        print(f"\nTotal Valid Provinces: {len(valid_provinces)}")
        
        # Check standard 34 count (23 provinces, 5 autonomous regions, 4 municipalities, 2 SARs)
        # Note: Taiwan is often included in CN maps.
        if len(valid_provinces) >= 30:
            print("\nSUCCESS: Map data seems adequate for the game.")
        else:
            print("\nWARNING: Province count seems low.")

    except Exception as e:
        print(f"Error parsing GeoJSON: {e}")

if __name__ == "__main__":
    verify_map_materials()
