# expressjs_demo

There is currently 4 endpoints set up and other endpoints will lead to deadends

Run npm run dev to start the server. port is fixed to 8080 for this scenario.


1. Sample Usage http://localhost:8080/api/emissions/1/year/2000/state/California

Returns the Value of carbon emission in the year 2000 for the state of California.

2.  Sample Usage http://localhost:8080/api/emissions/2/from/2003/to/2006/state/California

Returns the Value of Carbon emission across a span of given years for the state of California (2003-2006) in this case.

3.  Sample Usage http://localhost:8080/api/emissions/3/state/Wisconsin

Inserts a series into mongoDb from the https://www.eia.gov/opendata/qb.php?category=2251609 given a State 

4. SAmple Usage http://localhost:8080/api/emissions/3/from/2003/to/2006

Returns the state of the greatest accumlated value  of carbon emission across the given years from the mongodb

