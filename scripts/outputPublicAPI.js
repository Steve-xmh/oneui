// Use it in devtools
b = $$('article > h2')
c = b.map(v => {
    const params = []
    const results = []
    if (v.nextElementSibling.nextElementSibling.localName === 'table')
        for (const row of v.nextElementSibling.nextElementSibling.tBodies[0].rows) {
            switch (row.cells.length) {
                case 4: {
            const [fieldEl, typeEl, defaultEl, descEl] = row.cells
            params.push({
                field: fieldEl.innerText.trim(),
                type: typeEl.innerText.trim(),
                defaultValue: defaultEl.innerText.trim(),
                desc: descEl.innerText.trim(),
            })
            break
                }
                case 3: {
            const [fieldEl, typeEl, descEl] = row.cells
            params.push({
                field: fieldEl.innerText.trim(),
                type: typeEl.innerText.trim(),
                defaultValue: '',
                desc: descEl.innerText.trim(),
            })
            break
                }
            }
        }
    if (v.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.localName === 'table')
        for (const row of v.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.tBodies[0].rows) {
            const [fieldEl, typeEl, descEl] = row.cells
            results.push({
                field: fieldEl.innerText.trim(),
                type: typeEl.innerText.trim(),
                desc: descEl.innerText.trim(),
            })
        }
    return {
        name: v.childNodes[1].innerText.trim(),
        desc: v.childNodes[2].nodeValue.trim(),
        params,
        results,
    }
})
JSON.stringify(c)