# Compiler boundaries

<GraphStack title="TEXT">

- **Web** :tada: &amp; &nbsp; app: 2 js, 1 css

</GraphStack>

<GraphStack title="TEXT" v-if="true">

- **Web** :tada: &amp; &nbsp; app: 2 js, 1 css

</GraphStack>

<GraphTable title="SPACE">

| First   name | Count |
| --- | ---: |
| A   *B  C*   D | 2 |

</GraphTable>

<GraphTable title="SPACE" v-if="true">

| First   name | Count |
| --- | ---: |
| A   *B  C*   D | 2 |

</GraphTable>

<Endpoint title="LANG">

```js{1,3}
one
two
three
```

```ts:line-numbers
value
```

```cpp{1}
value
```

```c++
value
```

```
unmarked
```

</Endpoint>

<Endpoint title="LANG" v-if="true">

```js{1,3}
one
two
three
```

```ts:line-numbers
value
```

```cpp{1}
value
```

```c++
value
```

```
unmarked
```

</Endpoint>

<GraphStack title="NO BLANK">
- web: 2 js
</GraphStack>

<GraphStack title="NO BLANK" v-if="true">
- web: 2 js
</GraphStack>
