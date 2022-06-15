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
              code: "export default function({input}) {\nreturn { out: !input };\n}"
            },
            ports: {
              "input": {
                direction: "in",
                dataType: "boolean",
              },
              "out": {
                direction: "out",
                dataType: "boolean",
                links: [
                  {
                    nodeID: "node-2",
                    portID: "data"
                  }
                ]
              },
            },
          },
          "node-2": {
            type: "block",
            name: "out",
            block: {
              name: "printer"
            },
            ports: {
              "data": {
                direction: "in",
                dataType: "boolean",
              },
            },
          },
        },
      },
    },
  }
}
