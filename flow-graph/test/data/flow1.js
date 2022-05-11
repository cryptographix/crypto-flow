export default {
  project: {
    title: "invert-bit project",
    flows: {
      "invert-bit": {
        type: "root",
        name: "invert bit",

        ports: {
          "in": {
            type: "in",
            dataType: "boolean"
          }
        },
        
        nodes: {
          "inverter": {
            type: "code",
            name: "inverter",
            block: {
              code: "export process = ()=>{\nthis.out = !this.in;\n}"
            },
            ports: {
              "in": {
                type: "in",
                dataType: "boolean",
              },
              "out": {
                type: "out",
                dataType: "boolean",
                links: [
                  {
                    nodeID: "node-2",
                    portID: "in"
                  }
                ]
              },
            },
          },
          "node-2": {
            type: "output",
            name: "out",
            ports: {
              "in": {
                type: "in",
                dataType: "boolean",
              },
            },
          },
        },
      },
    },
  }
}
