/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 *
 * Generic form builder for config-driven Suitelets
 *
 * This module provides reusable functions for building NetSuite forms
 * from declarative column configurations.
 */

define(['N/ui/serverWidget'], function(serverWidget) {

    /**
     * Builds a Suitelet sublist from column configuration
     *
     * @param {serverWidget.Form} form - NetSuite form object
     * @param {Object} options - Configuration options
     * @param {string} options.sublistId - ID for the sublist
     * @param {string} options.sublistLabel - Display label for sublist
     * @param {Array} options.columns - Array of column config objects
     * @param {Array} options.data - Array of data rows to populate
     * @returns {serverWidget.Sublist} The created sublist
     */
    function buildSublist(form, options) {
        const { sublistId, sublistLabel, columns, data } = options;

        // Create sublist
        const sublist = form.addSublist({
            id: sublistId || 'custpage_results',
            type: serverWidget.SublistType.LIST,
            label: sublistLabel || 'Results'
        });

        // Add columns from configuration
        columns.forEach(col => {
            sublist.addField({
                id: col.id,
                label: col.label,
                type: col.type
            });
        });

        // Populate data rows
        data.forEach((row, lineNum) => {
            columns.forEach(col => {
                const value = extractValue(row, col.valueAccessor);
                sublist.setSublistValue({
                    id: col.id,
                    line: lineNum,
                    value: value !== null && value !== undefined ? value : ''
                });
            });
        });

        return sublist;
    }

    /**
     * Extracts value from data row using accessor
     *
     * @param {Object} row - Data row object
     * @param {string|Function} accessor - Property name or transformation function
     * @returns {*} The extracted value
     */
    function extractValue(row, accessor) {
        if (typeof accessor === 'function') {
            return accessor(row);
        }
        return row[accessor];
    }

    /**
     * Builds a complete form with sublist from configuration
     *
     * @param {Object} context - Suitelet context
     * @param {Object} config - Configuration object
     * @param {string} config.title - Form title
     * @param {string} config.sublistId - Sublist ID
     * @param {string} config.sublistLabel - Sublist label
     * @param {Array} config.columns - Column configurations
     * @param {Array} config.data - Data rows
     * @returns {serverWidget.Form} The complete form
     */
    function buildFormFromConfig(context, config) {
        const form = serverWidget.createForm({
            title: config.title
        });

        // Add any additional form fields (filters, buttons, etc.)
        if (config.fields) {
            config.fields.forEach(field => {
                form.addField({
                    id: field.id,
                    label: field.label,
                    type: field.type
                }).updateDisplayType({
                    displayType: field.displayType || serverWidget.FieldDisplayType.NORMAL
                });
            });
        }

        // Build sublist from config
        buildSublist(form, {
            sublistId: config.sublistId,
            sublistLabel: config.sublistLabel,
            columns: config.columns,
            data: config.data
        });

        // Add submit button if needed
        if (config.hasSubmitButton) {
            form.addSubmitButton({
                label: config.submitLabel || 'Submit'
            });
        }

        return form;
    }

    /**
     * Helper function to validate column configuration
     *
     * @param {Array} columns - Column configuration array
     * @throws {Error} If configuration is invalid
     */
    function validateColumnConfig(columns) {
        if (!Array.isArray(columns)) {
            throw new Error('Column configuration must be an array');
        }

        columns.forEach((col, index) => {
            if (!col.id) {
                throw new Error(`Column at index ${index} missing required "id" property`);
            }
            if (!col.label) {
                throw new Error(`Column "${col.id}" missing required "label" property`);
            }
            if (!col.type) {
                throw new Error(`Column "${col.id}" missing required "type" property`);
            }
            if (!col.valueAccessor) {
                throw new Error(`Column "${col.id}" missing required "valueAccessor" property`);
            }
        });
    }

    return {
        buildSublist,
        buildFormFromConfig,
        extractValue,
        validateColumnConfig
    };
});
