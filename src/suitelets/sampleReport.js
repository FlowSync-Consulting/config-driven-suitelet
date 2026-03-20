/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 *
 * Sample Suitelet demonstrating config-driven pattern
 *
 * This Suitelet shows how to use the config-driven pattern to build
 * a reporting interface with minimal code.
 */

define(['N/ui/serverWidget', '../config/sampleColumns', '../lib/formBuilder'],
    function(serverWidget, columnConfig, formBuilder) {

        /**
         * Suitelet entry point
         *
         * @param {Object} context
         * @param {ServerRequest} context.request
         * @param {ServerResponse} context.response
         */
        function onRequest(context) {
            try {
                if (context.request.method === 'GET') {
                    const form = buildReportForm();
                    context.response.writePage(form);
                } else {
                    // Handle POST if needed
                    context.response.write('POST not implemented');
                }
            } catch (e) {
                log.error('Error in Suitelet', e);
                context.response.write('Error: ' + e.message);
            }
        }

        /**
         * Builds the report form using config-driven pattern
         *
         * @returns {serverWidget.Form}
         */
        function buildReportForm() {
            // Fetch data (in real implementation, this would query NetSuite)
            const data = getSampleData();

            // Build form using configuration
            const form = formBuilder.buildFormFromConfig(context, {
                title: 'Territory Performance Report',
                sublistId: 'custpage_results',
                sublistLabel: 'Territory Summary',
                columns: columnConfig.TERRITORY_SUMMARY_COLUMNS,
                data: data
            });

            return form;
        }

        /**
         * Sample data for demonstration
         * In production, this would query saved searches or custom records
         *
         * @returns {Array<Object>}
         */
        function getSampleData() {
            return [
                {
                    territoryName: 'Northeast',
                    priorYearRevenue: 2500000,
                    currentYearRevenue: 2875000,
                    goalAmount: 3000000
                },
                {
                    territoryName: 'Southeast',
                    priorYearRevenue: 1800000,
                    currentYearRevenue: 2100000,
                    goalAmount: 2200000
                },
                {
                    territoryName: 'Midwest',
                    priorYearRevenue: 2200000,
                    currentYearRevenue: 2450000,
                    goalAmount: 2600000
                },
                {
                    territoryName: 'Southwest',
                    priorYearRevenue: 1600000,
                    currentYearRevenue: 1920000,
                    goalAmount: 2000000
                },
                {
                    territoryName: 'West',
                    priorYearRevenue: 3100000,
                    currentYearRevenue: 3400000,
                    goalAmount: 3500000
                }
            ];
        }

        return {
            onRequest: onRequest
        };
    }
);
