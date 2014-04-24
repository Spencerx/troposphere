Troposphere
===========


Configuration
-------------

```bash
cp troposphere/settings/local.py.dist troposphere/settings/local.py
```

Edit `local.py` with your own settings. You'll have to generate a new
keypair from Groupy for the Troposphere application. The configuration
variable `OAUTH_PRIVATE_KEY_PATH` should refer to the absolute path of that key.

### Building static assets

Troposophere requires Gulp for building static assets. Gulp requires a [recent
Node.js installation][1]. Then install gulp globally. And other dependencies locally:

```
npm install -g gulp
npm install
```


Then, the build static assets, use

```
gulp
```

If you're developing, you'll want to automatically rebuild assets with watch:

```
gulp watch
```

When you modify anything in the `static` directory, everything will be rebuilt appropriately.

### Virtualenv

```
mkdir -p /opt/env
virtualenv /opt/env/troposphere
source /opt/env/troposphere/bin/activate
pip install -r requirements.txt
```


Development Server
------------------

```bash
python manage.py runserver 0.0.0.0:5000
````

Production Server
-----------------

There's an example Apache configuration file in etc/trosposhere.conf. Modify it
to your liking.

```bash
ln -s /opt/dev/troposphere/etc/troposphere.conf /etc/apache2/sites-available/troposphere.conf
a2ensite troposphere.conf
service apache2 reload
```

Troposphere should then be running on port `5000`.

[1]: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint-elementary-os
