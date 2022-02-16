```
docker run -it -v `pwd`:/root/ vz-ocr-lighting bash
docker build -t vz-ocr-lighting .; docker run -it -v `pwd`:/root --env-file=.env vz-ocr-lighting bash
```