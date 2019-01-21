import { TestStatus } from '../testStatus';
import { TestVisitor } from './visitors/testVisitor';

export class TestInstance {
    public get name() { return this._name; }
    public get status() { return this._status; }
    public get func() { return this._func; }
    /**
     * @param func The test function
     * @param status The test's status
     */
    constructor(private _name: string, private _func: Function, private _status: TestStatus) { }

    public async run(context) {
        await this.func(context);
    }

    public async accept<T>(visitor: TestVisitor<T>): Promise<T> {
        return await visitor.visitTest(this);
    }

    public clone() {
        return new TestInstance(this.name, this._func, this._status);
    }
}