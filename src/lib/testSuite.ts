import { TestStatus } from './testStatus';
import { Report } from './reporting/report/report';
import { CompositeReport } from './reporting/report/compositeReport';
import { SuccessfulTestReport } from './reporting/report/successfulTestReport';
import { performance } from 'perf_hooks';
import { SkippedTestReport } from './reporting/report/skippedTestReport';
import { FailedTestReport } from './reporting/report/failedTestReport';

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
        private beforeAll: () => any,
        private beforeEach: () => any,
        private afterEach: () => any,
        private afterAll: () => any,
    ) { }

    public async run(): Promise<Report> {
        const activeTests = this.getActiveTests();

        if (!activeTests || Object.keys(activeTests).length === 0) {
            throw new Error(`No tests found for ${this.name}. Did you forget to add the @test decorator?`);
        }

        try {
            await this.beforeAll.bind(this.context)();
        } catch (err) {
            return new FailedTestReport(this.name, err.message, 0);
        }

        const report = new CompositeReport(this.name);
        for (const testName in activeTests) {
            const test = activeTests[testName];

            const testReport = this.hasTestcases(test)
                ? await this.runTestcases(testName, test)
                : await this.runTest(testName, test);

            report.addReport(testReport);
        }

        try {
            await this.afterAll.bind(this.context)();
        } catch (err) {
            return new FailedTestReport(this.name, err.message, 0);
        }

        this.reportIgnoredTests(report);
        return report;
    }

    private async runTest(name: string, test: Function): Promise<Report> {

        const t0 = performance.now();
        try {
            await this.beforeEach.bind(this.context)();
            await test(this.context);
            await this.afterEach.bind(this.context)();
            return new SuccessfulTestReport(name, performance.now() - t0);
        }
        catch (err) {
            return new FailedTestReport(name, err.message, performance.now() - t0);
        }
    }

    private async runTestcases(name: string, testCases: { [name: string]: Function }): Promise<Report> {
        const report = new CompositeReport(name);

        for (const testCaseName in testCases) {
            const testCase = testCases[testCaseName];
            report.addReport(await this.runTest(testCaseName, testCase));
        }

        return report;
    }

    private async reportIgnoredTests(report: CompositeReport) {
        if (!this.hasIgnoredTests())
            return;

        for (const test of this.getIgnoredTests()) {
            report.addReport(new SkippedTestReport(test));
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
        return this.focusedTests && Object.keys(this.focusedTests).length > 0;
    }
}