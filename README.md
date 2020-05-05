# uu-bookkit-ext-seersc
Extensions to uuBookKit for SEERSC project

# Validations
Validations extension help you to create new validation rule and new validation message from templates stored in dictionary.

The extension is available only on pages with defined references to templates in uu5DataMap:
- In the Page menu open Update uu5DataMap and inset references to templates
```javascript
{
  "validation": {
    "ruleTemplate": "c84b4b771c0c142c0885830ee67cbd11",
    "messageTemplate": "3bfdcf76b8e8145de83062660094a041"
  }
}
```
- the references are codes from dictionary (see ValMsg Template and ValRule template dictionary entries)

The page with templates references will show "Add Rule" and "Add Message" buttons next to "Add Section" button in edit mode.
- **Add Rule** will create new section and will paste a content of validation rule template into the new section
- **Add Message** will create new dictionary entry from validation message template. The link to new entry is inserted at the end of the next session (note: the section must be created by add rule, otherwise the new dictionary entry will be created, but won't be pasted in the page).

The content of rule and message is editable directly from the page. The rule is edited as a text of the section (no dictionary entry is created for the rule), and the message is create as dictionary entry.

# Install as a User Script - Tampermonkey
1. Add https://tampermonkey.net/ into your browser
2. Install User script from this URL: [uubookkit-ext-seersc-validations.js](https://github.com/uubookkitext/uu-bookkit-ext-seersc/raw/master/uubookkit-ext-seersc-validations.js)
