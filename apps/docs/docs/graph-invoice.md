# GraphInvoice

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

<GraphInvoice title="QUOTE" from="mdxcn" to="Northwind">

- Valid until: May 01

| Description | Amount |
| --- | --- |
| Registry install | 0 |
| Custom graph | 2,400 |

**Estimate** 2,400

</GraphInvoice>

Amounts, quantities, rates and totals are literal strings. No totals, tax arithmetic or locale conversion is performed. Each field resolves independently: props, then item markers, then Markdown. An empty party string suppresses From/To fallback. Bold money paragraphs accent the total. The first non-money paragraph supplies the note; a detected table footer is ignored.
