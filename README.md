# BlockFrost Service
- https://blockfrost.io/
- https://docs.blockfrost.io/
- https://github.com/blockfrost/blockfrost-js
- https://github.com/blockfrost/blockfrost-js/wiki/BlockFrostAPI.md

# Usage
- See index.js, settings.json & event-...json
- e.g. lambda-local -l index.js -t 9000 -e event-blockchain-query.json

# PolicyIDs

- SDI (lab):
92be578d1c063b70edf9b2ca0b53c7a58142b65eba43a5b55bdd6cb7
https://cardanoscan.io/tokenPolicy/92be578d1c063b70edf9b2ca0b53c7a58142b65eba43a5b55bdd6cb7

- SDA (lab):
96dd4df64ec0857af3a90ebdb5d3318fbef6774fe8c4b50e090af1c6
https://cardanoscan.io/tokenPolicy/96dd4df64ec0857af3a90ebdb5d3318fbef6774fe8c4b50e090af1c6
                   
- SDI:
6dd60b94e766e94ea3886d7631990db6d468d202c42a482090ee3a17
https://cardanoscan.io/tokenPolicy/6dd60b94e766e94ea3886d7631990db6d468d202c42a482090ee3a17

- SDA:
14302595916298c0ba104801034dbc784d1ece283c943dfab0524d0d
https://cardanoscan.io/tokenPolicy/14302595916298c0ba104801034dbc784d1ece283c943dfab0524d0d
                   
- SDC:
e487d8ea06a917008df8822d65140cc933af324e805f4ddcae8fc089
https://cardanoscan.io/tokenPolicy/e487d8ea06a917008df8822d65140cc933af324e805f4ddcae8fc089

- SDF:
906ba07f6419a89d7b05cca88f0ff3ee2114936c373cb2156f8426ec
https://cardanoscan.io/tokenPolicy/906ba07f6419a89d7b05cca88f0ff3ee2114936c373cb2156f8426ec

# Setup if using with entityOS

BlockFrost As Service:

entityos.cloud.save(
{
    object: 'core_url',
    data:
    {
        title: 'BlockFrost',
        type: 4,
        url: 'https://github.com/blockfrost/blockfrost-js'
    }
});

Create a link to back to URL (as Service) to hold the projectId.
core_url mydigitstructure object id is 298, objectcontext is id of the URL (created above).
Category is Indentity [4].
Use lambda-local -l index.js -t 9000 -e event-blockchain-key-categories.json to see category values.

entityos.cloud.save(
{
    object: 'core_protect_key',
    data:
    {
        title: 'BlockFrost Project ID',
        object: 298,
        objectcontext: {url id},
        category: 4,
        type: 2,
        key: {project_ID}
    }
});

entityos.cloud.search(
{
    object: 'core_protect_key',
    fields: ['title', 'object', 'objectcontext', 'category', 'type', 'key'],
    filters: [{field: 'category', comparision: 'EQUAL_TO', value: 4}]
});

Create a link to back to URL (as Service) to hold the projectId.
Category is Blockchain Address [6].

entityos.cloud.save(
{
    object: 'core_protect_key',
    data:
    {
        title: 'Blockchain Address',
        object: 22,
        objectcontext: app.whoami().thisInstanceOfMe.user.id,
        category: 6,
        type: 1,
        key: {address}
    }
});

entityos.cloud.search(
{
    object: 'core_protect_key',
    fields: ['title', 'object', 'objectcontext', 'category', 'type', 'key'],
    filters: [{field: 'category', comparision: 'EQUAL_TO', value: 6}]
});