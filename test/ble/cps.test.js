import { cyclingPowerMeasurement } from '../../src/ble/cps/cycling-power-measurement.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

function toDataView(array) {
    return new DataView(new Uint8Array(array).buffer);
}

describe('Cycling Power Measurement decode', () => {

    test('power only', () => {
        // flags: 0, power: 86
        const res = cyclingPowerMeasurement.decode(toDataView([0, 0, 86, 0]));

        expect(res).toEqual({flags: 0, power: 86});
    });

    test('negative power', () => {
        const res = cyclingPowerMeasurement.decode(toDataView([0, 0, 0xFE, 0xFF]));

        expect(res.power).toBe(-2);
    });

    test('with wheel and crank revolution data', () => {
        // flags: 48 (wheel + crank data present), power: 33,
        // wheel revs: 42, wheel time: 24772, crank revs: 18, crank time: 1271
        const res = cyclingPowerMeasurement.decode(
            toDataView([48, 0, 33, 0, 42, 0, 0, 0, 196, 96, 18, 0, 247, 4])
        );

        expect(res.flags).toBe(48);
        expect(res.power).toBe(33);
        expect(res.cumulativeWheelRevolutions).toBe(42);
        expect(res.lastWheelEventTime).toBe(24772 * (1/2048));
        expect(res.cumulativeCrankRevolutions).toBe(18);
        expect(res.lastCrankEventTime).toBe(1271 * (1/1024));
    });

    test('ignores fields that do not fit in the buffer', () => {
        // flags say wheel + crank data present, but the data is truncated
        const res = cyclingPowerMeasurement.decode(toDataView([48, 0, 33, 0]));

        expect(res).toEqual({flags: 48, power: 33});
    });
});
