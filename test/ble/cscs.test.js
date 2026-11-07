import { cscMeasurement } from '../../src/ble/cscs/cycling-speed-cadence-measurement.js';
import { RevsOverTime } from '../../src/ble/cscs/revs-over-time.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

function toDataView(array) {
    return new DataView(new Uint8Array(array).buffer);
}

describe('CSC Measurement decode', () => {

    test('wheel revolution data', () => {
        const res = cscMeasurement.decode(
            toDataView([0x01, 0x0c,0x00,0x00,0x00, 0x44,0x1A])
        );

        expect(res).toEqual({
            flags: 1,
            cumulativeWheelRevolutions: 12,
            lastWheelEventTime: 6724 * (1/1024),
        });
    });

    test('crank revolution data', () => {
        const res = cscMeasurement.decode(
            toDataView([0x02, 0x02,0x00, 0x99,0x1D])
        );

        expect(res.flags).toBe(2);
        expect(res.cumulativeCrankRevolutions).toBe(2);
        expect(res.lastCrankEventTime).toBe(7577 * (1/1024));
        expect(res).not.toHaveProperty('cumulativeWheelRevolutions');
        expect(res).not.toHaveProperty('lastWheelEventTime');
    });

    test('wheel and crank revolution data', () => {
        const res = cscMeasurement.decode(
            toDataView([0x03, 0x0c,0x00,0x00,0x00, 0x44,0x1A, 0x02,0x00, 0x99,0x1D])
        );

        expect(res.flags).toBe(3);
        expect(res.cumulativeWheelRevolutions).toBe(12);
        expect(res.lastWheelEventTime).toBe(6724 * (1/1024));
        expect(res.cumulativeCrankRevolutions).toBe(2);
        expect(res.lastCrankEventTime).toBe(7577 * (1/1024));
    });

    test('ignores fields that do not fit in the buffer', () => {
        const res = cscMeasurement.decode(toDataView([0x03, 0x0c,0x00,0x00,0x00]));

        expect(res).toEqual({flags: 3, cumulativeWheelRevolutions: 12});
    });
});

describe('cadence', () => {
    // time is in seconds (lastCrankEventTime is already scaled by 1/1024)
    const cadence = RevsOverTime({
        resolution: 1,
        maxRevs:    2**16,
        maxTime:    (2**16) * (1/1024),
        format:     (x) => Math.round(x * 60),
    });
    cadence.setMaxRateCount(3);

    test('calculate initial returns 0', () => {
        cadence.reset();
        expect(cadence.calculate(1, 1)).toEqual(0);
    });

    test('calculate 1 rev per second is 60 rpm', () => {
        cadence.reset();
        expect(cadence.calculate( 1,  1)).toEqual(0);
        expect(cadence.calculate(63, 63)).toEqual(60);
    });

    test('calculate coasting', () => {
        cadence.reset();
        expect(cadence.calculate( 1,  1)).toEqual(0);
        expect(cadence.calculate(40, 40)).toEqual(60);
        expect(cadence.calculate(40, 50)).toEqual(0);
        expect(cadence.calculate(40, 60)).toEqual(0);
        expect(cadence.calculate(41, 61)).toEqual(60);
    });

    test('calculate 0 after no rev change over moving clock', () => {
        cadence.reset();
        expect(cadence.calculate( 1,  1)).toEqual(0);

        expect(cadence.calculate(42, 42  )).toEqual(60);
        expect(cadence.calculate(43, 43  )).toEqual(60);
        expect(cadence.calculate(43, 43.5)).toEqual(0);
    });

    test('calculate keeps last value for repeated messages up to max rate count', () => {
        cadence.reset();
        expect(cadence.calculate( 1,  1)).toEqual(0);

        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(0);
    });

    test('calculate start stop', () => {
        cadence.reset();
        expect(cadence.calculate( 1,  1)).toEqual(0);

        expect(cadence.calculate(40, 40)).toEqual(60);

        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(0);

        expect(cadence.calculate(42, 42)).toEqual(60);
        expect(cadence.calculate(43, 43)).toEqual(60);
        expect(cadence.calculate(43, 44)).toEqual(0);

        expect(cadence.calculate(44, 45)).toEqual(60);
    });

    test('calculate keeps value while messages repeat', () => {
        cadence.reset();
        expect(cadence.calculate( 1,  1)).toEqual(0);
        expect(cadence.calculate(40, 40)).toEqual(60);
        expect(cadence.calculate(40, 40)).toEqual(60);
        expect(cadence.calculate(40, 40)).toEqual(60);
        expect(cadence.calculate(40, 40)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
        expect(cadence.calculate(41, 41)).toEqual(60);
    });

    test('calculate time rollover', () => {
        cadence.reset();
        // event time wraps from just below 64s back to the start
        expect(cadence.calculate(61, 61)).toEqual(0);
        expect(cadence.calculate(62, 62)).toEqual(60);
        expect(cadence.calculate(63, 63)).toEqual(60);
        expect(cadence.calculate(64,  0)).toEqual(60);
        expect(cadence.calculate(65,  1)).toEqual(60);
        expect(cadence.calculate(66,  2)).toEqual(60);
        expect(cadence.calculate(67,  3)).toEqual(60);
        expect(cadence.calculate(68,  4)).toEqual(60);
    });

    test('calculate revs rollover', () => {
        cadence.reset();
        expect(cadence.calculate(2**16 - 1, 1)).toEqual(0);
        expect(cadence.calculate(0, 2)).toEqual(60);
    });
});
