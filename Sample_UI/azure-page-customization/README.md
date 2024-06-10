# the script is just to ease dev process as files can be changed remotely;

## select html that needs to be customized, generate SAS token with permission read/write, and copy Blob SAS URL to publish.js, e.g.
https://us5wostg.blob.core.windows.net/customb2c/customize-ui.html?sp=rw&st=2023-07-24T19:39:50Z&se=2023-07-25T03:39:50Z&spr=https&sv=2022-11-02&sr=b&sig=ACfOlm7iqpahXoaqMT1R0zEj2IMH3SNbabI8F%2BkQQy8%3D
then run `yarn custom-b2c`

## for testing:
https://portal.azure.com/#view/Microsoft_Azure_Storage/ContainerMenuBlade/~/overview/storageAccountId/%2Fsubscriptions%2Fe73a6265-44e3-43d7-bc82-48b299e744ff%2FresourceGroups%2Fus5-wo-sandbox%2Fproviders%2FMicrosoft.Storage%2FstorageAccounts%2Fus5wostg/path/customb2c/etag/%220x8DB84808AB96BAF%22/defaultEncryptionScope/%24account-encryption-key/denyEncryptionScopeOverride~/false/defaultId//publicAccessVal/Blob

## login
https://vijaybr.b2clogin.com/vijaybr.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_test&client_id=19a2e979-e9f4-4e2f-b448-dcdb4a2eca1c&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Findex.html&scope=19a2e979-e9f4-4e2f-b448-dcdb4a2eca1c%20offline_access%20openid&response_type=token

## forgot password
https://vijaybr.b2clogin.com/vijaybr.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_resettest&client_id=19a2e979-e9f4-4e2f-b448-dcdb4a2eca1c&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Findex.html&scope=19a2e979-e9f4-4e2f-b448-dcdb4a2eca1c%20offline_access%20openid&response_type=token