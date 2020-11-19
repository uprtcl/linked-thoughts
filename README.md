# Project under development

## Dev

Checkout and run the [backend server](https://github.com/uprtcl/js-uprtcl-server)

(Needs docker installed)

```
cd ..
git clone https://github.com/uprtcl/js-uprtcl-server.git
cd js-uprtcl-server
```

run dgraph

```
sudo docker run --rm -it -p 8080:8080 -p 9080:9080 -p 8000:8000 -v ~/dgraph:/dgraph dgraph/standalone:v20.03.3
```

add a .env file like [this one](https://gist.github.com/pepoospina/6993d1f03773b3b333008f66838ccae7) and
on another terminal run the server in debug mode

```
npm i
npm run debug
```

Then run this app

```
cd ../linked-thoughts
npm i
npm run dev
```

Head to http://localhost:8002
