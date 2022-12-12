# crypto-flow
Low-code data-flow engine for security and cryptography

# Model

## Blocks
`Blocks` process input data into output data. Blocks are JS classes.

They can be as low-level or high-level as required.

### Integration
Blocks possess a set of data items - Ports, Parameters and Plugins - which in effect simply public "properties" on the JS class that implements the Blocks function.


Blocks integrate into a flow via Input/Output *Ports*m which allow the block to receive and send data to/from other parts of a Flow. *Parameters* are configuration items that control the operation of the Block, and *Plugins* are a special type of Parameter that act like a slot that must be filled with an instance of another compatible Block, allowing plugable composition.



Example: A cipher-mode block like CBC, would have a slot for a block-cipher (such as AES), and an optional slot for a padding algorithm block, where the block-cipher *implements* `org.cryptographix.crypto.IBlockCipher` and the padding block `org.cryptographix.crypto.ICipherPaddingMode`.





