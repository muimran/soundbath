import requests

coords = [48, -13, 64, 3]

# get a random lat coordinate
lat_response = requests.get(f'https://www.random.org/integers/?num=1&min={coords[0]}&max={coords[2]}&col=1&base=10&format=plain&rnd=new')
# get a random lng coordinate
lng_response = requests.get(f'https://www.random.org/integers/?num=1&min={coords[1]}&max={coords[3]}&col=1&base=10&format=plain&rnd=new')
# get a random string
str_response = requests.get('https://www.random.org/strings/?num=1&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new')
# Check the status code
if lat_response.status_code == 200 and lng_response.status_code == 200 and str_response.status_code == 200:
    # Parse the response text into a list of integers
    lat = int(lat_response.text)
    lng = int(lng_response.text)
    
    # Open a new CSV file in write mode
    with open('web/data/data.csv', 'a') as file:
        file.write(f'{lat},{lng},{str_response.text}')
else:
    print(f'Failed to get data: {lat_response.status_code}, {lng_response.status_code}, {str_response.status_code}')
    print(f'{lat_response.text}, {lng_response.text}, {str_response.text}')
