import { TestStatus } from './testStatus';
import { Report } from './reporting/report/report';
import { CompositeReport } from './reporting/report/compositeReport';
import { SuccessfulTestReport } from './reporting/report/successfulTestReport';
import { performance } from 'perf_hooks';
import { SkippedTestReport } from './reporting/report/skippedTestReport';
import { FailedTestReport } from './reporting/report/failedTestReport';
import { Logger } from './logger/logger';

/** 
 * Contains a list of tests, focusedTests, ignored tests, and a context in which to execute them.
 */
export class TestSuite<T> {
    public get name(): string { return this._name; }
    public get status(): TestStatus { return this._status; }

    constructor(
        private _name: string,
        private _status: TestStatus,
        public context: T,
        private tests: { [name: string]: any },
        private focusedTests: { [name: string]: any },
        private ignoredTests: string[],
        private beforeAllMethods: Array<() => any>,
        private beforeEachMethods: Array<() => any>,
        private afterEachMethods: Array<() => any>,
        private afterAllMethods: Array<() => any>,
    ) { }

    public async run(logger?: Logger): Promise<Report> {
        const activeTests = this.getActiveTests();

        if (!activeTests || Object.keys(activeTests).length === 0) {
            throw new Error(`No tests found for ${this.name}. Did you forget to add the @test decorator?`);
        }

        try {
            await this.beforeAll();
        } catch (err) {
            return this.getFailureReport(err.message, logger);
        }

        const report = new CompositeReport(this.name, logger);
        if (logger) { logger.increaseIndentation(); }

        for (const testName in activeTests) {
            const test = activeTests[testName];

            const testReport = this.hasTestcases(test)
                ? await this.runTestcases(testName, test, logger)
                : await this.runTest(testName, test, logger);

            report.addReport(testReport);
        }


        this.reportIgnoredTests(report);

        if (logger) { logger.decreaseIndentation(); }

        try {
            await this.afterAll();
        } catch (err) {
            return this.getFailureReport(err.message, logger);
        }

        return report;
    }

    private async runTest(name: string, test: Function, logger?: Logger): Promise<Report> {

        const t0 = performance.now();
        try {
            await this.beforeEach();
            await test(this.context);
            await this.afterEach();
            const report = new SuccessfulTestReport(name, performance.now() - t0, logger);
            return report;
        }
        catch (err) {
            return new FailedTestReport(name, err.message, performance.now() - t0, logger);
        }
    }

    private async runTestcases(name: string, testCases: { [name: string]: Function }, logger?: Logger): Promise<Report> {
        const report = new CompositeReport(name, logger);

        if (logger) { logger.increaseIndentation(); }
        for (const testCaseName in testCases) {
            const testCase = testCases[testCaseName];
            const testReport = await this.runTest(testCaseName, testCase, logger);
            report.addReport(testReport);
        }
        if (logger) { logger.decreaseIndentation(); }

        return report;
    }

    private async reportIgnoredTests(report: CompositeReport, logger?: Logger) {
        if (!this.hasIgnoredTests())
            return;

        for (const test of this.getIgnoredTests()) {
            report.addReport(new SkippedTestReport(test, logger));
        }
    }

    private getActiveTests(): { [name: string]: any } {
        return this.hasFocusedTests()
            ? this.focusedTests
            : this.tests;
    }

    private getIgnoredTests(): string[] {
        return this.hasFocusedTests()
            ? this.ignoredTests.concat(Object.keys(this.tests))
            : this.ignoredTests;
    }

    private hasTestcases(test: Function | { [name: string]: Function }) {
        return !(test instanceof Function);
    }

    private hasIgnoredTests() {
        return this.getIgnoredTests().length > 0;
    }

    private hasFocusedTests() {
        return this.focusedTests && this.focusedTests.length > 0;
    }

    private getFailureReport(reason: string, logger?: Logger) {
        const report = new CompositeReport(this.name, logger);

        for (const testName in this.getActiveTests()) {
            const test = this.tests[testName];

            if (this.hasTestcases(test)) {
                for (const subTestName in test) {
                    report.addReport(new FailedTestReport(subTestName, reason, 0, logger));
                }
            }
            else {
                report.addReport(new FailedTestReport(testName, reason, 0, logger));
            }
        }

        for (const testName in this.getIgnoredTests()) {
            report.addReport(new SkippedTestReport(testName, logger));
        }

        return report;
    }

    private beforeEach() {
        this.beforeEachMethods.forEach(x => x.bind(this.context)());
    }

    private beforeAll() {
        this.beforeAllMethods.forEach(x => x.bind(this.context)());
    }

    private afterEach() {
        this.afterEachMethods.forEach(x => x.bind(this.context)());
    }

    private afterAll() {
        this.afterAllMethods.forEach(x => x.bind(this.context)());
    }
}