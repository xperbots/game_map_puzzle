import os
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom

MATERIALS_DIR = "map_materials"

def analyze_svg(filename):
    path = os.path.join(MATERIALS_DIR, filename)
    if not os.path.exists(path):
        print(f"❌ File not found: {filename}")
        return

    print(f"\n--- Analyzing SVG: {filename} ---")
    try:
        tree = ET.parse(path)
        root = tree.getroot()
        
        # XML namespaces can be tricky, strip them for simple counting or handle them
        # Usually checking 'path' tags is enough
        paths = []
        for elem in root.iter():
            if 'path' in elem.tag:
                paths.append(elem)
        
        print(f"Total <path> elements found: {len(paths)}")
        
        # Check for IDs or Names
        ids = [p.get('id') for p in paths if p.get('id')]
        names = [p.get('name') for p in paths if p.get('name')]
        titles = [p.get('title') for p in paths if p.get('title')]
        
        print(f"Paths with 'id': {len(ids)}")
        print(f"Paths with 'name': {len(names)}")
        print(f"Paths with 'title': {len(titles)}")
        
        if len(ids) > 0:
            print(f"Example IDs: {ids[:5]}")
        
    except Exception as e:
        print(f"❌ Error parsing SVG: {e}")

def analyze_geojson(filename):
    path = os.path.join(MATERIALS_DIR, filename)
    if not os.path.exists(path):
        print(f"❌ File not found: {filename}")
        return

    print(f"\n--- Analyzing GeoJSON: {filename} ---")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'features' not in data:
            print("❌ No 'features' key found.")
            return

        features = data['features']
        print(f"Total features found: {len(features)}")
        
        # Check properties
        if len(features) > 0:
            props = features[0].get('properties', {})
            print(f"Available properties in first feature: {list(props.keys())}")
            
            names = []
            valid_geom = 0
            for feat in features:
                p = feat.get('properties', {})
                name = p.get('name') or p.get('adcode')
                if name:
                    names.append(name)
                
                geom = feat.get('geometry', {})
                if geom and geom.get('type') in ['Polygon', 'MultiPolygon']:
                    valid_geom += 1
            
            print(f"Features with 'name' or 'adcode': {len(names)}")
            print(f"Features with valid Geometry (Polygon/Multi): {valid_geom}")
            
            # Check for 34 provinces
            print(f"Example Names: {names[:5]}")

    except Exception as e:
        print(f"❌ Error parsing GeoJSON: {e}")

def main():
    analyze_svg("中华人民共和国.svg")
    analyze_svg("中华人民共和国各省.svg")
    analyze_geojson("中华人民共和国.geojson")
    analyze_geojson("中华人民共和国各省.geojson")

if __name__ == "__main__":
    main()
