#!/Users/erriza/anaconda/bin/python
from flask import Flask, jsonify, abort, make_response, request, url_for
import psycopg2

app = Flask(__name__)

try:
    conn = psycopg2.connect(database='HotspotDB', host='localhost', user='postgres')
    conn.set_isolation_level(0) # for older version of psycopg2
    #conn.autocommit = True
    cursor = conn.cursor()
except:
    print 'cannot connect to database'



######################
#
# Utility functions
#
######################
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( { 'error': 'Not found' } ), 404)


def make_public(hotspot):
    '''Utility function to convert hotspot ID to URI
    '''
    new_hotspot = {}
    for field in hotspot:
        if field == 'id':
            new_hotspot['uri'] = url_for('get_hotspot', hotspot_id = hotspot['id'], _external = True)
        else:
            new_hotspot[field] = hotspot[field]
    return new_hotspot



######################
#
# Landing pages
#
######################
@app.route("/")
def index():
    # return send_file('static/app/index.html') # cached
    return make_response(open('static/app/index.html').read())



######################
#
# Hotspot APIs
#
######################
@app.route('/freewifi/api/v1.0/hotspots/<lat>/<lon>/<radius>', methods = ['GET']) 
def get_nearby_hotspots(lat, lon, radius):
    query = '''SELECT Hotspots.id, name, latitude, longitude, ROUND(AVG(rating)) AS rating 
               FROM Hotspots 
               LEFT OUTER JOIN Ratings 
               ON Hotspots.id = Ratings.id 
               WHERE earth_box(ll_to_earth(%s, %s), %s) @> ll_to_earth(Hotspots.latitude, Hotspots.longitude) 
               GROUP BY Hotspots.id, name, latitude, longitude
               LIMIT 15''' % (lat, lon, radius)
    cursor.execute(query)
    records = cursor.fetchall() # list of tuples: [(id, name, lat, lon, rating), ...]
    
    if len(records)==0:
        abort(404)
    
    fields = ('id', 'name', 'latitude', 'longitude', 'rating')
    nearby_hotspots = map(lambda x: dict(zip(fields, map(str, x))), records)
    
    return jsonify( {'nearby_hotspots': nearby_hotspots} )


@app.route('/freewifi/api/v1.0/hotspots/<int:hotspot_id>', methods = ['GET'])
def get_hotspot(hotspot_id):
    query = '''SELECT *
               FROM Hotspots
               WHERE id = %s
            ''' % hotspot_id
    cursor.execute(query)
    records = cursor.fetchall() # [(id, name, 'latitude', 'longitude')]
    
    if len(records) == 0:
        abort(404)
        
    fields = ('id', 'name', 'latitude', 'longitude')
    hotspot = map(lambda x: dict(zip(fields, x)), records) # [{'id':.., 'name':.., 'lat':..., 'lon'}]
    
    return jsonify( { 'hotspot': make_public(hotspot[0]) } )


@app.route('/freewifi/api/v1.0/hotspots', methods = ['POST'])
def create_hotspot():
    if not request.json or not 'name' in request.json:
        abort(400)
    
    name = request.json['name']
    lat = request.json.get('latitude', "")
    lon = request.json.get('longitude', "")
    
    # escape single quote for postgres
    name = name.replace("'", "''")
    
    # SQL input sanitization TBD
    
    query = '''INSERT INTO Hotspots(name, latitude, longitude)
               VALUES('%s', %s, %s)
            ''' % (name, lat, lon)
    cursor.execute(query)
    
    hotspot = {
        'id': 0, # ??? I don't want to query the database just for the ID..
        'name': name,
        'latitude': lat,
        'longitude': lon,
    }
    #print name, lat, lon # kept for debugging
    return jsonify( { 'hotspot': make_public(hotspot) } ), 201


# Not finished
@app.route('/freewifi/api/v1.0/hotspots/<int:hotspot_id>', methods = ['PUT'])
def update_hotspot(hotspot_id):
    hotspot = filter(lambda x: x['id'] == hotspot_id, hotspots)
    if len(hotspot) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'name' in request.json and type(request.json['name']) != unicode:
        abort(400)
    if 'latitude' in request.json and type(request.json['latitude']) is not float:
        abort(400)
    if 'longitude' in request.json and type(request.json['longitude']) is not float:
        abort(400)
    hotspot[0]['name'] = request.json.get('name', hotspot[0]['name'])
    hotspot[0]['latitude'] = request.json.get('latitude', hotspot[0]['latitude'])
    hotspot[0]['longitude'] = request.json.get('longitude', hotspot[0]['longitude'])
    return jsonify( { 'hotspot': make_public(hotspot[0]) } )


# Not finished
@app.route('/freewifi/api/v1.0/hotspots/<int:hotspot_id>', methods = ['DELETE'])
def delete_hotspot(hotspot_id):
    hotspot = filter(lambda x: x['id'] == hotspot_id, hotspots)
    if len(hotspot) == 0:
        abort(404)
    hotspots.remove(hotspot[0])
    return jsonify( { 'result': True } )



######################
#
# Rating APIs
#
######################
@app.route('/freewifi/api/v1.0/rating', methods = ['GET']) 
def get_rating():
    if not request.json or not 'ip' in request.json:
        abort(400)
    
    ip = request.json['ip']
    
    return 0


@app.route('/freewifi/api/v1.0/rating', methods = ['POST']) 
def add_rating():
    return 0


@app.route('/freewifi/api/v1.0/rating', methods = ['PUT']) 
def update_rating():
    return 0



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
