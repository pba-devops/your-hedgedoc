# Node Lutim

This project provide a node api for lutim.

The source code is strongly inspired by [node-imgur](https://github.com/kaimallea/node-imgur)

## Module usage

### Installation

```
npm install lutim
```

### Usage

#### Requiring the module

```javascript
var lutim = require('lutim');
```

#### setApiUrl(url: String)

By default node-lutim url will be [https://framapic.org/](https://framapic.org/). You can change it using `setApiUrl(url)`.

```javascript
lutim.setApiUrl(lutimUrl);
```

#### getApiUrl()

Getter for the current api url.

Returns a String

```javascript
lutim.getApiUrl() // => 'http://myUrl/'
```

#### getServerInfos(): Promise

See [https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-informations-about-the-server](https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-informations-about-the-server)

Returns a Promise

```javascript
lutim.getServerInfos()
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })
```

#### uploadImage(filePath: String, deleteDay?: number, firstView?: number, keepExif?: number, crypt?: number): Promise

See [https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#add-images](https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#add-images)

Returns a Promise

```javascript
lutim.uploadImage(filePath)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })

lutim.uploadImage(filePath, deleteDay, firstView, keepExif, crypt)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })
```

#### deleteImage(realShort: String, token: String): Promise

See [https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#delete-images](https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#delete-images)

Returns a Promise

```javascript
lutim.deleteImage(realShort, token)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })
```

#### modifyImage(realShort: String, token: String, deleteDay: number, firstView?: number): Promise

See [https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#modify-images](https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#modify-images)

Returns a Promise

```javascript
lutim.modifyImage(realShort, token, deleteDay)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })

lutim.modifyImage(realShort, token, deleteDay, firstView)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })
```

#### getImage(short: String): Promise

See [https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-images](https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-images)

Returns a Promise

```javascript
lutim.getImage(short)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })
```

#### getImageInfos(real_short: String): Promise

See [https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-informations-about-an-image](https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-informations-about-an-image)

Returns a Promise

```javascript
lutim.getImageInfos(realShort)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })
```

#### getImageCountAndStatus(short: String, token: String): Promise

See [https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-counter-and-status-of-image](https://framagit.org/fiat-tux/hat-softwares/lutim/wikis/API#get-counter-and-status-of-image)

Returns a Promise

```javascript
lutim.getImageCountAndStatus(short, token)
  .then(function (res) {
    // Handle res
  })
  .catch(function (err) {
    // Handle err
  })
```

### Credit

The code is inspired by [node-imgur](https://github.com/kaimallea/node-imgur)

Made for [lutim](https://framagit.org/fiat-tux/hat-softwares/lutim)
