import { VASTClient } from '../../dist/vast-client-node.js';

const vastClient = new VASTClient();

async function parseSimpleInline() {
    const parsedVast = await vastClient.get("https://statics.dmcdn.net/h/html/vast/simple-inline.xml");
    // eslint-disable-next-line no-console
    console.log(parsedVast);
}

await parseSimpleInline();