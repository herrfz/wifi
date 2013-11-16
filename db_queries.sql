# erriza@betelgeuse [23:47:01]-> /Applications/Postgres.app/Contents/MacOS/bin/createdb HotspotDB
# erriza@betelgeuse [23:47:12]-> /Applications/Postgres.app/Contents/MacOS/bin/psql HotspotDB

CREATE EXTENSION cube
CREATE EXTENSION earthdistance

CREATE TABLE Hotspots(id SERIAL, name TEXT, latitude FLOAT, longitude FLOAT)

INSERT INTO Hotspots(name, latitude, longitude) VALUES("Starbucks BIP Bandung", -6.908582, 107.610663)

DELETE FROM Hotspots WHERE name LIKE 'test%'


SELECT *, 3956 * 2 * ASIN(SQRT(POWER(SIN((-6.908361 - ABS(spot.latitude)) * PI()/180 / 2), 2) + COS(-6.908361 * PI()/180 ) * COS(ABS(spot.latitude) * PI()/180) * POWER(SIN((107.610698 - spot.longitude) * PI()/180 / 2), 2) )) 
AS distance
FROM Hotspots spot
HAVING distance < 10
ORDER BY distance
LIMIT 10


SELECT *, earth_distance(ll_to_earth( {current_user_lat}, {current_user_lng} ), ll_to_earth(Hotspots.latitude, Hotspots.longitude)) 
AS distance
FROM Hotspots 
ORDER BY distance ASC
LIMIT 10


SELECT *
FROM Hotspots 
WHERE earth_box(ll_to_earth({current_user_lat}, {current_user_lng}), {radius}) @> ll_to_earth(Hotspots.latitude, Hotspots.longitude) 
LIMIT 10





CREATE TABLE Comments(hotspotid INT, datetime TIMESTAMP WITH TIME ZONE, comment TEXT)

INSERT INTO Comments VALUES(0, now(), 'test comment')



CREATE TABLE Ratings(id INT, ipaddr TEXT, date DATE, rating INT)

INSERT INTO Ratings VALUES(1, '127.0.0.1', '2013-11-15', 5)


SELECT Hotspots.id, name, latitude, longitude, ROUND(AVG(rating)) AS rating 
FROM Hotspots 
LEFT OUTER JOIN Ratings 
ON Hotspots.id = Ratings.id 
WHERE earth_box(ll_to_earth([[input lat]], [[input lon]]), [[input radius]]) @> 
                ll_to_earth(Hotspots.latitude, Hotspots.longitude) 
GROUP BY Hotspots.id, name, latitude, longitude