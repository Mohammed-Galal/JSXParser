# JSXParser

JSXParser is a tiny javascript library, that takes a string as input, then parses it's jsx roots, and returns the string with ths jsx roots fully parsed.

> the main purpose of making such a function, is that **babel/parser** doesn't give the flexbility, specially, when it comes to create a new javascript library like **react or vue**, as we are the front-end-developers rely heavely on such frameworks.

> so I decided to make my own jsx parser, that acchieves the easinness and flexbility of creating a new framework, and manipulating the DOM Tree.

/ input

```javascript
// index.js
import JSXParser from "JSXParser";

const content = `
  "// some js code"
  const root = "<>lorem ipsum <h1>hello <span> {"world"}</span></h1></>"
  // some js code
`;

console.log(JSXParser(content));
```

// output

```javascript
// some js code
const root = {
  key: 0,
  scripts: ["world"],
  components: [],
  dom: ["fragment", [], [["h1", [], ["hello ", ["span", [], [0]]]]]],
};
// some js code
```

- **key:**

  > defines the index of the root among it's siblings, in order to differentiate the root with his key.

- **scripts:**

  > gathers all the scripts interpolation in the jsx root, so that to ensure that is no scripts is going to be multiblied.
  > and the script can be accessed by its index, as shown in the examples below.

- **components:**

  > gathers all tags that start with Capital-case letter or includes **\.** (dot)

- **dom:**

  > the dom structure, and follows the scheme of [tagName, [attrs], [children]].

  !!! . please note that if element is a component, the component reffrence will be stored in the components array and the element's tagName gets replaced with the component index in the array.
