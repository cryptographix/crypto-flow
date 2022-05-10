# crypto-flow
Low-code data-flow engine for security and cryptography

# Model

## Blocks
`Blocks` process input data into output data. Blocks are JS classes.

They can be as low-level or high-level as required.

### Integration
Blocks integrate into a flow via Parameters, Ports and Plugins.

Blocks possess a set of data items, that are simply public "properties" on a JS class.

##Parameters## are configuration items that control the operation of the Block, 

Input/Output ports allow the block to receive and send data to other parts of a Flow.

A Plugin is a slot, that must be filled with an instance of another compatible Block, allowing plugable composition.

Example: A cipher-mode block like CBC, would have a slot for a block-cipher (such as AES), and an optional slot for a padding algorithm block, where the block-cipher *implements* `org.cryptographix.crypto.IBlockCipher` and the padding block `org.cryptographix.crypto.ICipherPaddingMode`.





