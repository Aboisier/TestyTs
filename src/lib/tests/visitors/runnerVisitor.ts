import { TestsCollection } from '../testsCollection';
import { Test } from '../test';
import { TestsVisitor } from './testVisitor';
import { Logger } from '../../logger/logger';
import { SuccessfulTestReport } from '../../reporting/report/successfulTestReport';
import { FailedTestReport } from '../../reporting/report/failedTestReport';
import { TestStatus } from '../../testStatus';
import { SkippedTestReport } from '../../reporting/report/skippedTestReport';
import { Report } from '../../reporting/report/report';
import { CompositeReport } from '../../reporting/report/compositeReport';
import { FailedTestsReportVisitor } from './failedTestsReportVisitor';

export class TestsRunnerVisitor implements TestsVisitor<Report> {
    private contexts: any[] = [];

    constructor(private logger: Logger) { }

    public async visitTestCollection(tests: TestsCollection): Promise<Report> {
        if (tests.context) { this.contexts.push(tests.context); }

        const report = new CompositeReport(tests.name, this.logger);
        this.logger.increaseIndentation();

        try {
            await this.runAll(tests.beforeAllMethods, tests.context);
            await this.runTests(tests, report);
            await this.runAll(tests.afterAllMethods, tests.context);
        }
        catch (err) {
            const failedTestsVisitor = new FailedTestsReportVisitor(err.message, this.logger);
            return tests.accept(failedTestsVisitor);
        }

        this.logger.decreaseIndentation();
        if (tests.context) { this.contexts.pop(); }

        return report;
    }

    public async visitTest(test: Test): Promise<Report> {
        if (test.status === TestStatus.Ignored) {
            return new SkippedTestReport(test.name, this.logger);
        }

        try {
            const context = this.contexts.length > 0 ? this.contexts[this.contexts.length - 1] : undefined;
            await test.run(context);
            return new SuccessfulTestReport(test.name, 0, this.logger);
        }
        catch (err) {
            return new FailedTestReport(test.name, err.message, 0, this.logger);
        }
    }

    private async runTests(tests: TestsCollection, report: CompositeReport): Promise<void> {
        for (const id of tests.testIds) {
            await this.runAll(tests.beforeEachMethods, tests.context);
            const testReport = await tests.get(id).accept(this);
            await this.runAll(tests.afterEachMethods, tests.context);
            report.addReport(testReport);
        }
    }

    private async runAll(methods, context: any) {
        for (const method of methods) {
            await method.bind(context)();
        }
    }
}