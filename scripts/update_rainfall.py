import csv
import json
import os

# Define the paths to the files
csv_file_path = os.path.join('web', 'data', 'coordinates_rainfall_data.csv')
geojson_file_path = os.path.join('web', 'data', 'myData.geojson')

# Read the CSV data
with open(csv_file_path, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    csv_data = [row for row in reader if row['rainfall_mm'] not in ('', 'nan')]

# Load the GeoJSON data
with open(geojson_file_path) as geojson_file:
    geojson_data = json.load(geojson_file)

# Function to check if the coordinates match
def coords_match(feature, csv_row):
    lat, lon = map(float, csv_row['lat']), map(float, csv_row['long'])
    return feature['geometry']['coordinates'] == [lon, lat]

# Update the GeoJSON data with rainfall data from the CSV
for csv_row in csv_data:
    for feature in geojson_data['features']:
        if coords_match(feature, csv_row):
            feature['properties']['rainfall'] = csv_row['rainfall_mm']
            break  # Stop looking once we've found the matching feature

# Save the updated GeoJSON data
with open(geojson_file_path, 'w') as geojson_file:
    json.dump(geojson_data, geojson_file, indent=4)
