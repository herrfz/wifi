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
    
    # 'name' is renamed to 'infoWindow' to match angular-google-maps
    fields = ('id', 'infoWindow', 'latitude', 'longitude', 'rating') 
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
    
    # TODO: input type integrity checks
    
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



######################
#
# Rating APIs
#
######################
@app.route('/freewifi/api/v1.0/rating/<id>/<ip>/<date>', methods = ['GET']) 
def get_rating(id, ip, date):
    ## get star rating for the corresponding date
    query = '''SELECT rating, likes, unlikes 
               FROM Ratings
               WHERE id=%s AND ipaddr='%s' AND date='%s'
            ''' % (id, ip, date)
    cursor.execute(query)
    user_record = cursor.fetchall() # list of tuples: [ ... ] or null
    
    if len(user_record)==0:
        user = ('-1', '0', '0')
    else:
        user = tuple(map(str, user_record[0]))
        
    ## get aggregated rating, likes, unlikes for the hotspot
    query = '''SELECT SUM(likes) AS hotspot_likes, 
                      SUM(unlikes) AS hotspot_unlikes
               FROM Ratings
               WHERE id=%s
            ''' % id
    cursor.execute(query)
    hotspot_record = cursor.fetchall() # list of tuples: [ ... ] or null
    
    if hotspot_record[0]==(None, None):
        hotspot = ('0', '0')
    else:
        hotspot = tuple(map(str, hotspot_record[0]))
    
    fields = ('rating', 'likes', 'unlikes', 'hotspot_likes', 'hotspot_unlikes')
    result = dict(zip(fields, user + hotspot))
        
    return jsonify( { 'result': result } )


@app.route('/freewifi/api/v1.0/rating', methods = ['POST']) 
def add_rating():
    if not request.json:
        abort(400)
        
    # TODO: input type integrity checks 
    
    id = request.json['id']
    ip = request.json['ip']
    date = request.json['date']
    rating = request.json['rating']
    likes = request.json['likes']
    unlikes = request.json['unlikes']
    
    query = '''INSERT INTO Ratings(id, ipaddr, date, rating, likes, unlikes)
               VALUES (%s, '%s', '%s', %s, %s, %s)
            ''' % (id, ip, date, rating, likes, unlikes)
    cursor.execute(query)
    
    return jsonify( { 'result': True } )


@app.route('/freewifi/api/v1.0/rating', methods = ['PUT']) 
def update_rating():
    if not request.json:
        abort(400)
        
    # TODO: input type integrity checks 
    
    id = request.json['id']
    ip = request.json['ip']
    date = request.json['date']
    rating = request.json['rating']
    likes = request.json['likes']
    unlikes = request.json['unlikes']
    
    query = '''UPDATE Ratings
               SET rating=%s, likes=%s, unlikes=%s
               WHERE id=%s AND ipaddr='%s' AND date='%s'
            ''' % (rating, likes, unlikes, id, ip, date)
    cursor.execute(query)
    
    return jsonify( { 'result': True } )



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
