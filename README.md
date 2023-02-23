# JSXParser

JSXParser is a tiny javascript library, that takes a string as input, then parses it's jsx roots, and returns the string with ths jsx roots fully parsed.

> the main purpose of making such a function, is that **babel/parser** doesn't give the flexbility, specially, when it comes to create a new javascript library like **react or vue**, as we are the front-end-developers rely heavely on such frameworks.

> so I decided to make my own jsx parser, that achieves the easiness and flexibility of creating a new framework, and manipulating the DOM Tree.

!!! / this parser is intended to work along with webpack.

input

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

output

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

  !!! . please note that if element is a component, the component reference will be stored in the components array and the element's tagName gets replaced with the reference index in the array.

## Some Examples

- **normalElement:**

  input:

  ```javascript
  <h1>normal element</h1>
  ```

  output:

  ```javascript
  ({
    key: 0,
    scripts: [],
    components: [],
    dom: ["h1", [], ["normal element"]],
  });
  ```

- **fragmentElement:**

  input:

  ```javascript
  <>this is fragment Element</>
  ```

  output:

  ```javascript
  ({
    key: 0,
    scripts: [],
    components: [],
    dom: ["fragment", [], ["this is fragment Element"]],
  });
  ```

- **dynamicValues:**

  input:

  ```javascript
  <h1 calssName={"lorem ipsum"}>hello {"world"}</h1>
  ```

  output:

  ```javascript
  ({
    key: 0,
    scripts: ["lorem ipsum", "world"],
    components: [],
    dom: ["h1", ["calssName={0}"], ["hello ", 1]],
  });
  ```

- **nestedElements:**

  input:

  ```javascript
  <h1 id="parent">
    hello <span id="child">world</span>
  </h1>
  ```

  output:

  ```javascript
  ({
    key: 0,
    scripts: [],
    components: [],
    dom: [
      "h1",
      ["id='parent'"],
      ["hello ", ["span", ["id='child'"], ["world"]]],
    ],
  });
  ```

- **componentElement:**

  input:

  ```javascript
  <Header>this is a component that has children</Header>
  ```

  output:

  ```javascript
  ({
    key: 0,
    scripts: [],
    components: [Header],
    dom: [0, [], ["this is a component that has children"]],
  });
  ```

- ### real life React Content:

  input:

  ```javascript
  const UserContext = React.createContext({
    username: "johnny-appleseed",
    firstName: "John",
    lastName: "Appleseed",
  });
  const UserConsumer = UserContext.Consumer;

  class App extends React.Component {
    state = {
      user: {
        username: "jioke",
        firstName: "Kingsley",
        lastName: "Silas",
      },
    };

    render() {
      return (
        <div className="box">
          <User />
        </div>
      );
    }
  }

  const User = () => (
    <div>
      <UserProfile />
    </div>
  );

  const UserProfile = (props) => (
    <UserConsumer>
      {(context) => {
        return (
          <div>
            <div className="subtitle">Profile Page for</div>
            <h1 className="title">{context.username}</h1>
            <UserDetails />
          </div>
        );
      }}
    </UserConsumer>
  );

  const UserDetails = () => (
    <div>
      <UserConsumer>
        {(context) => {
          return (
            <div>
              <p>
                <b>Username:</b> {context.username}
              </p>
              <p>
                <b>First Name:</b> {context.firstName}
              </p>
              <p>
                <b>Last Name:</b> {context.lastName}
              </p>
            </div>
          );
        }}
      </UserConsumer>
    </div>
  );

  ReactDOM.render(<App />, document.getElementById("root"));
  ```

  output:

  ```javascript
  const UserContext = React.createContext({
    username: "johnny-appleseed",
    firstName: "John",
    lastName: "Appleseed",
  });
  const UserConsumer = UserContext.Consumer;

  class App extends React.Component {
    state = {
      user: {
        username: "jioke",
        firstName: "Kingsley",
        lastName: "Silas",
      },
    };

    render() {
      return {
        key: 0,
        scripts: [],
        components: [User],
        dom: ["div", ['className="box"'], [[0, []]]],
      };
    }
  }

  const User = () => ({
    key: 1,
    scripts: [],
    components: [UserProfile],
    dom: ["div", [], [[0, []]]],
  });

  const UserProfile = (props) => ({
    key: 2,
    scripts: [
      (context) => {
        return {
          key: 0,
          scripts: [context.username],
          components: [UserDetails],
          dom: [
            "div",
            [],
            [
              ["div", ['className="subtitle"'], ["Profile Page for"]],
              ["h1", ['className="title"'], [0]],
              [0, []],
            ],
          ],
        };
      },
    ],
    components: [UserConsumer],
    dom: [0, [], [0, "\n  "]],
  });

  const UserDetails = () => ({
    key: 3,
    scripts: [
      (context) => {
        return {
          key: 0,
          scripts: [context.username, context.firstName, context.lastName],
          components: [],
          dom: [
            "div",
            [],
            [
              ["p", [], [["b", [], ["Username:"]], 0]],
              ["p", [], [["b", [], ["First Name:"]], 1]],
              ["p", [], [["b", [], ["Last Name:"]], 2]],
            ],
          ],
        };
      },
    ],
    components: [UserConsumer],
    dom: ["div", [], [[0, [], [0, "\n    "]]]],
  });

  ReactDOM.render(
    {
      key: 4,
      scripts: [],
      components: [App],
      dom: [0, []],
    },
    document.getElementById("root")
  );
  ```
