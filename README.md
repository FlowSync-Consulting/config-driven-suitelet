# Config-Driven Suitelet Pattern

> Production-tested pattern for building maintainable, extensible NetSuite Suitelets with configuration-driven columns

## Overview

This pattern separates **what to display** (column configuration) from **how to display it** (form builder logic), enabling rapid development of complex reporting interfaces without repetitive code.

## Problem

Traditional Suitelet development requires 150+ lines of repetitive code for every set of columns:

```javascript
// ❌ Traditional approach: Hardcoded columns
function buildForm(form, data) {
    form.addField({ id: 'custpage_territory', label: 'Territory', type: 'text' });
    form.addField({ id: 'custpage_revenue', label: 'Revenue', type: 'currency' });
    form.addField({ id: 'custpage_variance', label: 'Variance', type: 'currency' });
    // ... 50 more similar lines

    // Then populate data
    sublist.setSublistValue({ id: 'custpage_territory', line: 0, value: data.territory });
    sublist.setSublistValue({ id: 'custpage_revenue', line: 0, value: data.revenue });
    // ... 50 more similar lines
}
```

**Issues:**
- UI definition mixed with data mapping
- Adding/removing columns requires modifying core rendering code
- Cannot reuse form builder across projects
- Column order changes require code refactoring

## Solution: Configuration Objects

Define columns as declarative configuration, separate from rendering logic:

```javascript
// ✅ Config-driven approach
const COMMISSION_COLUMNS = [
    {
        id: 'custpage_territory',
        label: 'Territory',
        type: serverWidget.FieldType.TEXT,
        valueAccessor: 'territory'
    },
    {
        id: 'custpage_variance',
        label: 'Variance',
        type: serverWidget.FieldType.CURRENCY,
        valueAccessor: (result) => {
            const actual = parseFloat(result.actualRevenue) || 0;
            const goal = parseFloat(result.goalAmount) || 0;
            return (actual - goal).toFixed(2);
        }
    }
];

// Generic form builder (reusable across projects)
function buildFormFromConfig(form, columns, data) {
    columns.forEach(col => {
        form.addField({ id: col.id, label: col.label, type: col.type });
    });

    data.forEach((row, lineNum) => {
        columns.forEach(col => {
            const value = typeof col.valueAccessor === 'function'
                ? col.valueAccessor(row)
                : row[col.valueAccessor];
            form.setSublistValue({ id: col.id, line: lineNum, value });
        });
    });
}
```

**Benefits:**
- Adding columns = adding config objects
- Same rendering logic works for any column set
- Easy to reorder, hide, or modify columns
- Form builder is 100% reusable

## Architecture

```
src/
├── config/
│   ├── commissionColumns.js      # Column definitions for commission view
│   ├── accountDetailColumns.js   # Column definitions for account drill-down
│   └── goalTrackingColumns.js    # Column definitions for goal tracking
├── lib/
│   ├── formBuilder.js             # Generic form builder (reusable)
│   └── dataAccessors.js           # Reusable value accessor functions
└── suitelets/
    └── commissionReporting.js     # Main Suitelet (imports configs)
```

## Key Concepts

### 1. Column Configuration Schema

Each column config object has:

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Field ID (must be unique, prefixed with `custpage_`) |
| `label` | String | Display label for column header |
| `type` | FieldType | NetSuite field type (`TEXT`, `CURRENCY`, `DATE`, etc.) |
| `valueAccessor` | String or Function | How to extract value from data row |

### 2. Value Accessors

Value accessors can be simple property names or transformation functions:

```javascript
// Simple property accessor
{ valueAccessor: 'territory' }

// Computed value accessor
{
    valueAccessor: (row) => {
        const actual = parseFloat(row.actualRevenue) || 0;
        const goal = parseFloat(row.goalAmount) || 0;
        return goal > 0 ? ((actual / goal) * 100).toFixed(1) : '0.0';
    }
}
```

### 3. Reusable Form Builder

The form builder is generic and works with any column configuration:

```javascript
/**
 * Builds a Suitelet form from column configuration
 * @param {serverWidget.Form} form - NetSuite form object
 * @param {Array} columns - Column configuration array
 * @param {Array} data - Data rows to populate
 */
function buildFormFromConfig(form, columns, data) {
    // Create sublist
    const sublist = form.addSublist({
        id: 'custpage_results',
        type: serverWidget.SublistType.LIST,
        label: 'Results'
    });

    // Add columns from config
    columns.forEach(col => {
        sublist.addField({
            id: col.id,
            label: col.label,
            type: col.type
        });
    });

    // Populate data
    data.forEach((row, lineNum) => {
        columns.forEach(col => {
            const value = extractValue(row, col.valueAccessor);
            sublist.setSublistValue({
                id: col.id,
                line: lineNum,
                value: value || ''
            });
        });
    });
}

function extractValue(row, accessor) {
    return typeof accessor === 'function' ? accessor(row) : row[accessor];
}
```

## Usage Example

### Step 1: Define Column Configuration

```javascript
// config/reportColumns.js
const TERRITORY_SUMMARY_COLUMNS = [
    {
        id: 'custpage_territory',
        label: 'Territory',
        type: 'TEXT',
        valueAccessor: 'territoryName'
    },
    {
        id: 'custpage_current_revenue',
        label: 'Current Revenue',
        type: 'CURRENCY',
        valueAccessor: 'currentRevenue'
    },
    {
        id: 'custpage_goal',
        label: 'Goal',
        type: 'CURRENCY',
        valueAccessor: 'goalAmount'
    },
    {
        id: 'custpage_percent_to_goal',
        label: '% to Goal',
        type: 'PERCENT',
        valueAccessor: (row) => {
            const revenue = parseFloat(row.currentRevenue) || 0;
            const goal = parseFloat(row.goalAmount) || 0;
            return goal > 0 ? (revenue / goal) : 0;
        }
    }
];

module.exports = { TERRITORY_SUMMARY_COLUMNS };
```

### Step 2: Use in Suitelet

```javascript
// suitelets/territoryReport.js
define(['N/ui/serverWidget', '../config/reportColumns', '../lib/formBuilder'],
    function(serverWidget, config, formBuilder) {

        function onRequest(context) {
            if (context.request.method === 'GET') {
                const form = serverWidget.createForm({
                    title: 'Territory Summary Report'
                });

                // Fetch data from saved search or custom logic
                const data = fetchTerritoryData();

                // Build form using config
                formBuilder.buildFormFromConfig(
                    form,
                    config.TERRITORY_SUMMARY_COLUMNS,
                    data
                );

                context.response.writePage(form);
            }
        }

        return { onRequest };
    }
);
```

## Real-World Impact

This pattern was developed for a commission reporting platform processing 43,000+ transactions nightly across 5 territories, 12 months, and 6 metrics per cell.

### Before Config-Driven Pattern
- 150+ lines of repetitive code per view
- 3 hours to add new column across all views
- New projects required forking entire form builder

### After Config-Driven Pattern
- ~40 lines of config per view
- 5 minutes to add new column (just add config object)
- Form builder is 100% reusable across projects

## Best Practices

1. **Keep configs separate from logic** - Store column definitions in dedicated config files
2. **Use meaningful accessor names** - Clear property names or well-documented functions
3. **Handle null/undefined gracefully** - Always provide fallbacks in value accessors
4. **Make accessors pure functions** - No side effects, predictable outputs
5. **Document complex transformations** - Add comments for business logic in accessors

## Testing

The pattern enables easy unit testing:

```javascript
// Test value accessors in isolation
test('percent to goal calculation', () => {
    const accessor = COLUMNS.find(c => c.id === 'custpage_percent_to_goal').valueAccessor;
    const row = { currentRevenue: 75000, goalAmount: 100000 };
    expect(accessor(row)).toBe(0.75);
});
```

## License

MIT License - See LICENSE file for details

## Related Patterns

- [Batch Transaction Search](https://github.com/FlowSync-Consulting/batch-transaction-search) - Parameter-driven reusable search tool
- [Multi-Mode Suitelet](https://github.com/FlowSync-Consulting/multi-mode-suitelet) - Single Suitelet with multiple workflow modes
