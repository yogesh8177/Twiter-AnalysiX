# Twitter-AnalysiX
Data mining through twitter API (Under development).

# Steps to run

1. Create `.env` file and fill in the details by reffering `env.worker` file.

2. Run `docker-compose up -d` to start your services

3. Run `docker-compose logs -f <service-name>` to view logs for respective services.

_This app is distributed across following components:_

1. ```twiterEngine.js (fetches data from twitter API and stores it to mongoDB)```
2. ```processText.js (Processes frequency of words, hastags and co-occuring words)```
3. ```processSources.js (Processes the sources of tweets like android phone, iphone etc)```
4. ```processLocations.js (Processes the location of tweets!)```
5. ```processMedia.js (Processes frequency of media like urls, photos etc)```
