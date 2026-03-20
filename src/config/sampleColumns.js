/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 *
 * Sample column configuration for config-driven Suitelets
 *
 * This demonstrates how to define columns declaratively rather than imperatively.
 * Each column object contains all metadata needed for rendering and data mapping.
 */

define(['N/ui/serverWidget'], function(serverWidget) {

    /**
     * Example: Territory summary columns
     * Shows territory performance with revenue, goals, and variance
     */
    const TERRITORY_SUMMARY_COLUMNS = [
        {
            id: 'custpage_territory',
            label: 'Territory',
            type: serverWidget.FieldType.TEXT,
            valueAccessor: 'territoryName'
        },
        {
            id: 'custpage_prior_year',
            label: 'Prior Year Revenue',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: 'priorYearRevenue'
        },
        {
            id: 'custpage_current_year',
            label: 'Current Year Revenue',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: 'currentYearRevenue'
        },
        {
            id: 'custpage_growth',
            label: 'Growth %',
            type: serverWidget.FieldType.PERCENT,
            valueAccessor: (row) => {
                const prior = parseFloat(row.priorYearRevenue) || 0;
                const current = parseFloat(row.currentYearRevenue) || 0;
                if (prior === 0) return current > 0 ? 1.0 : 0;
                return (current - prior) / Math.abs(prior);
            }
        },
        {
            id: 'custpage_goal',
            label: 'Goal',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: 'goalAmount'
        },
        {
            id: 'custpage_percent_to_goal',
            label: '% to Goal',
            type: serverWidget.FieldType.PERCENT,
            valueAccessor: (row) => {
                const current = parseFloat(row.currentYearRevenue) || 0;
                const goal = parseFloat(row.goalAmount) || 0;
                return goal > 0 ? current / goal : 0;
            }
        },
        {
            id: 'custpage_variance',
            label: 'Variance',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: (row) => {
                const current = parseFloat(row.currentYearRevenue) || 0;
                const goal = parseFloat(row.goalAmount) || 0;
                return (current - goal).toFixed(2);
            }
        }
    ];

    /**
     * Example: Account detail columns
     * Shows customer-level detail for drill-down views
     */
    const ACCOUNT_DETAIL_COLUMNS = [
        {
            id: 'custpage_customer',
            label: 'Customer',
            type: serverWidget.FieldType.TEXT,
            valueAccessor: 'customerName'
        },
        {
            id: 'custpage_account_number',
            label: 'Account #',
            type: serverWidget.FieldType.TEXT,
            valueAccessor: 'accountNumber'
        },
        {
            id: 'custpage_revenue_jan',
            label: 'Jan Revenue',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: 'revenueJan'
        },
        {
            id: 'custpage_revenue_feb',
            label: 'Feb Revenue',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: 'revenueFeb'
        },
        {
            id: 'custpage_revenue_mar',
            label: 'Mar Revenue',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: 'revenueMar'
        },
        {
            id: 'custpage_ytd_total',
            label: 'YTD Total',
            type: serverWidget.FieldType.CURRENCY,
            valueAccessor: (row) => {
                const jan = parseFloat(row.revenueJan) || 0;
                const feb = parseFloat(row.revenueFeb) || 0;
                const mar = parseFloat(row.revenueMar) || 0;
                return (jan + feb + mar).toFixed(2);
            }
        }
    ];

    return {
        TERRITORY_SUMMARY_COLUMNS,
        ACCOUNT_DETAIL_COLUMNS
    };
});
