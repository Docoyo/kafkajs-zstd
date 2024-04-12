import {compress, decompress} from "cppzst";

export default (compressionParameters, decompressionParameters) => () => ({
  async compress(encoder) {
    return compress(encoder.buffer, compressionParameters);
  },

  async decompress(buffer) {
    return decompress(buffer, decompressionParameters);
  },
})
