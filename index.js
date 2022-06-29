/*
	See:
	https://learn.entityos.cloud/learn-function-automation

	This is node app to automate tasks
	https://www.npmjs.com/package/lambda-local:

	lambda-local -l index.js -t 9000 -e event-blockchain-query.json
	lambda-local -l index.js -t 9000 -e event-blockchain-key-categories.json

	Setup:
	See README.md

	BlockFrost API:
	https://github.com/blockfrost/blockfrost-js/wiki/BlockFrostAPI.md

	!!See /node_modules/blockchainfactory for blockfrost integration code.
*/

exports.handler = function (event, context, callback)
{
	var entityos = require('entityos')
	var _ = require('lodash');

	entityos.set(
	{
		scope: '_event',
		value: event
	});

	//Event: {"site": "default"}

	entityos.set(
	{
		scope: '_context',
		value: context
	});

	entityos.set(
	{
		scope: '_callback',
		value: callback
	});

	var settings;

	if (event != undefined)
	{
		if (event.site != undefined)
		{
			settings = event.site;
			//ie use settings-[event.site].json
		}
		else
		{
			settings = event;
		}
	}

	entityos._util.message(
	[
		'-',
		'EVENT-SETTINGS:',
		settings
	]);

	entityos.init(main, settings)
	entityos._util.message('Using entityos module version ' + entityos.VERSION);
	
	function main(err, data)
	{
		var settings = entityos.get({scope: '_settings'});
		var event = entityos.get({scope: '_event'});

		entityos._util.message(
		[
			'-',
			'SETTINGS:',
			settings
		]);

		var namespace = settings.blockchain.namespace;

		if (event.namespace != undefined)
		{
			namespace = event.namespace;
		}

		if (namespace != undefined)
		{
			entityos._util.message(
			[
				'-',
				'NAMESPACE:',
				namespace
			]);

			var blockchainfactory = require('blockchainfactory/blockchainfactory.' + namespace + '.js');
		}

		if (_.has(blockchainfactory, 'init'))
		{
			blockchainfactory.init();
		}

		entityos.add(
		{
			name: 'blockchain-query',
			code: function ()
			{
				entityos.invoke('blockchain-protect-key-categories');
			}
		});

		entityos.add(
		{
			name: 'blockchain-protect-key-categories',
			code: function (param, response)
			{
				if (response == undefined)
				{
					entityos.cloud.search(
					{
						object: 'setup_core_protect_key_category',
						fields: [{name:'title'}],
						rows: 9999,
						callback: 'blockchain-protect-key-categories',
						callbackParam: param
					});
				}
				else
				{
					var keyCategories = {}
					_.each(response.data.rows, function (row) {keyCategories[row.title] = row.id})

					entityos.set(
					{
						scope: 'blockchain',
						context: 'protect-key-categories',
						value: keyCategories
					});

					entityos.invoke('blockchain-query-addresses')
				}
			}
		});

		entityos.add(
		{
			name: 'blockchain-query-addresses',
			code: function ()
			{
				var event = entityos.get({scope: '_event'});

				if (event.address != undefined)
				{
					entityos.set(
					{
						scope: '_event',
						context: 'addresses',
						value: [event.address]
					});

					entityos.invoke('blockchain-protect-key-identites');
				}
				else
				{
					entityos.invoke('blockchain-protect-key-addresses');
				}
			}
		});

		entityos.add(
		{
			name: 'blockchain-protect-key-addresses',
			code: function (param, response)
			{
				var keyCategories = entityos.get(
				{
					scope: 'blockchain',
					context: 'protect-key-categories'
				});

				if (response == undefined)
				{
					entityos.cloud.search(
					{
						object: 'core_protect_key',
						fields: [{ name: 'key' }],
						filters: 
						[
							{
								field: 'category',
								comparison: 'EQUAL_TO',
								value: keyCategories['Blockchain Address']
							}
						],
						rows: 9999,
						callback: 'blockchain-protect-key-addresses'
					});
				}
				else
				{
					var addresses = entityos.set(
					{
						scope: '_event',
						context: 'addresses',
						value: _.map(response.data.rows, 'key')
					});

					console.log(addresses)
					entityos.invoke('blockchain-protect-key-identites');
				}
			}
		});

		entityos.add(
		{
			name: 'blockchain-protect-key-identites',
			code: function (param, response)
			{
				var keyCategories = entityos.get(
				{
					scope: 'blockchain',
					context: 'protect-key-categories'
				});

				if (response == undefined)
				{
					entityos.cloud.search(
					{
						object: 'core_protect_key',
						fields: [{ name: 'key' }, { name: 'title'}],
						filters: 
						[
							{
								field: 'category',
								comparison: 'EQUAL_TO',
								value: keyCategories['Identity']
							}
						],
						rows: 9999,
						callback: 'blockchain-protect-key-identites'
					});
				}
				else
				{
					var identites = entityos.set(
					{
						scope: 'blockchain',
						context: 'identites',
						value: response.data.rows
					});

					var projectIndentity = _.find(identites, function (identity) {return identity.title == 'BlockFrost Project ID'});

					console.log(projectIndentity)

					if (projectIndentity != undefined)
					{
						entityos.set(
						{
							scope: '_event',
							context: 'blockfrostProjectId',
							value: projectIndentity.key
						});
					}

					entityos.invoke('blockchain-query-process');
				}
			}
		});

		entityos.add(
		{
			name: 'blockchain-query-process',
			code: function ()
			{
				var event = entityos.get({scope: '_event'});

				console.log(event)

				if (event.processComplete == undefined)
				{
					event.processComplete = 'blockchain-query-complete'
				}

				// See /blockchainfactory
				entityos.invoke('blockchain-blockfrost-query')
			}
		});

		entityos.add(
		{
			name: 'blockchain-query-complete',
			code: function (data)
			{
				entityos.invoke('util-end', data)
			}
		});
		
		entityos.add(
		{
			name: 'util-log',
			code: function (data)
			{
				entityos.cloud.save(
				{
					object: 'core_debug_log',
					data: data
				});
			}
		});

		entityos.add(
		{
			name: 'util-end',
			code: function (data, error)
			{
				var callback = entityos.get(
				{
					scope: '_callback'
				});

				if (error == undefined) {error = null}

				if (callback != undefined)
				{
					callback(error, data);
				}
			}
		});

		/* STARTS HERE! */

		var event = entityos.get({scope: '_event'});

		var controller = event.controller;

		if (controller == undefined)
		{
			console.log('!! No controller [event.controller]')
		}
		else
		{
			entityos.invoke(controller);
		}
	}
}