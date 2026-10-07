# Sheet and Invoice parity

<GraphSheet title="RFC">

### Scope

| Item | Owner | Status |
| --- | --- | --- |
| CLI copies files | priya | done |
| Docs previews | jon | now |

### Out of scope

| Item | Owner | Status |
| --- | --- | --- |
| npm package | — | later |
| Figma kit | — | later |

</GraphSheet>

<GraphSheet title="RFC" v-bind='{"headers":["Item","Owner","Status"],"sections":[{"title":"Scope","rows":[["CLI copies files","priya","done"],["Docs previews","jon","now"]]},{"title":"Out of scope","rows":[["npm package","—","later"],["Figma kit","—","later"]]}]}' />

<GraphSheet title="SURFACE">

### Frame

| Name | Kind | Stable |
| --- | --- | --- |
| Graph | primitive | yes |
| GraphBody | primitive | yes |

### Charts

| Name | Kind | Stable |
| --- | --- | --- |
| GraphTable | component | yes |
| GraphSheet | component | new |

</GraphSheet>

<GraphSheet title="SURFACE" v-bind='{"headers":["Name","Kind","Stable"],"sections":[{"title":"Frame","rows":[["Graph","primitive","yes"],["GraphBody","primitive","yes"]]},{"title":"Charts","rows":[["GraphTable","component","yes"],["GraphSheet","component","new"]]}]}' />

<GraphInvoice
  title="INVOICE 0041"
  from="mdxcn"
  to="Acme Studio"
>

- No.: 0041
- Issued: Mar 12, 2026
- Due: Apr 11, 2026

| Description | Qty | Rate | Amount |
| --- | --- | --- | --- |
| Design system | 1 | 4,200 | 4,200 |
| Motion pass | 1 | 1,800 | 1,800 |
| Docs rewrite | 8h | 180 | 1,440 |

**Amount due** 7,440

Net 30. Wire to the account on file.

</GraphInvoice>

<GraphInvoice title="INVOICE 0041" from="mdxcn" to="Acme Studio" v-bind='{"meta":[{"label":"No.","value":"0041"},{"label":"Issued","value":"Mar 12, 2026"},{"label":"Due","value":"Apr 11, 2026"}],"items":[{"description":"Design system","qty":"1","rate":"4,200","amount":"4,200"},{"description":"Motion pass","qty":"1","rate":"1,800","amount":"1,800"},{"description":"Docs rewrite","qty":"8h","rate":"180","amount":"1,440"}],"totals":[{"label":"Amount due","value":"7,440","accent":true}],"note":"Net 30. Wire to the account on file."}' />

<GraphInvoice title="QUOTE" from="mdxcn" to="Northwind">

- Valid until: May 01

| Description | Amount |
| --- | --- |
| Registry install | 0 |
| Custom graph | 2,400 |

**Estimate** 2,400

</GraphInvoice>

<GraphInvoice title="QUOTE" from="mdxcn" to="Northwind" v-bind='{"meta":[{"label":"Valid until","value":"May 01"}],"items":[{"description":"Registry install","amount":"0"},{"description":"Custom graph","amount":"2,400"}],"totals":[{"label":"Estimate","value":"2,400","accent":true}]}' />
