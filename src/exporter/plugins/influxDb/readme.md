
### InfluxDB ###

This plugins allow your to export data to influxdb

### Exemple ###
	exports:
		  - type: influxDb
		    database: mybd.foo.com
		    port: 8086
		    database: gato

### Options ###

| Name  |Type|Description|Required|
|---|----|-----------|--------|
|*host*|`string`||True|
|*database*|`string`||True|
|*port*|`integer`||No, default: `8086`|

