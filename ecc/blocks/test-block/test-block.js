import { readBlockConfig } from "../../scripts/utils.js";

export default async function init(el) {
 const config = readBlockConfig(el);
 console.log(config);
}
