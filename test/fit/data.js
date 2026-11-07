// App Data Input

// Records
const records = [
    {
        timestamp: 1669140869000,  // 1038075269, 133, 197, 223, 61,
        position_lat: -128450465,  // sint32, semicircles, 95, 0, 88, 248,
        position_long: 1978610201, // sint32, semicircles,  25, 50, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 90,            // uint8, bpm, 90
        cadence: 70,               // uint8, rpm, 70
        distance: 7.66,            // uint32, scale 100, m, 766, 254, 2, 0, 0,
        speed: 6.717,              // uint16, scale 1000, m/s, 6717, 61, 26,
        power: 160,                // uint16, w, 160, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
    {
        timestamp: 1669140870000,  // 1038075270, 134, 197, 223, 61,
        position_lat: -128449747,  // sint32, semicircles, 45, 3, 88, 248,
        position_long: 1978610154, // sint32, semicircles, 234, 49, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 91,            // uint8, bpm,
        cadence: 71,               // uint8, rpm
        distance: 14.36,           // uint32, scale 100, m, 156, 5, 0, 0,
        speed: 6.781,              // uint16, scale 1000, m/s, 6781, 125, 26,
        power: 161,                // uint16, w, 161, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
    {
        timestamp: 1669140871000,  // 1038075271, 135, 197, 223, 61,
        position_lat: -128449037,  // sint32, semicircles, 243, 5, 88, 248,
        position_long: 1978609898, // sint32, semicircles, 234, 48, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 92,            // uint8, bpm
        cadence: 72,               // uint8, rpm
        distance:	21.34,           // uint32, scale 100, m, 86, 8, 0, 0,
        speed: 7.08,               // uint16, scale 1000, m/s, 7080, 168, 27,
        power: 162,                // uint16, w, 162, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
    {
        timestamp: 1669140872000,  // 1038075272, 136, 197, 223, 61,
        position_lat: -128448324,  // sint32, semicircles, 188, 8, 88, 248,
        position_long: 1978609588, // sint32, semicircles, 180, 47, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 93,            // uint8, bpm
        cadence: 73,               // uint8, rpm
        distance:	28.56,           // uint32, scale 100, m, 40, 11, 0, 0,
        speed: 7.498,              // uint16, scale 1000, m/s, 7498, 74, 29,
        power: 163,                // uint16, w, 163, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
];

// Laps
const laps = [
    {
        start_time: 1669140869000, // start time
        timestamp: 1669140872000,  // end time
    },
];

const appData = {records, laps};
// END App Data



// Expected FITjs
function FITjs(args = {}) {
    const headerCRC = args.crc ? 12387 : 0;
    const fileCRC   = args.crc ? 28067 : undefined;

    return [
        // file header
        {
            type: 'header',
            length: 14,
            headerSize: 14,
            protocolVersion: '2.0',
            profileVersion: '21.40',
            dataSize: 427,
            dataType: '.FIT',
            crc: headerCRC,
        },
        // definition file_id
        {
            type: 'definition',
            architecture: 0,
            name: 'file_id',
            local_number: 0,
            length: 24,
            data_record_length: 16,
            fields: [
                {number: 4, size: 4, base_type: 'uint32'},
                {number: 1, size: 2, base_type: 'uint16'},
                {number: 2, size: 2, base_type: 'uint16'},
                {number: 3, size: 4, base_type: 'uint32z'},
                {number: 5, size: 2, base_type: 'uint16'},
                {number: 0, size: 1, base_type: 'enum'},
            ],
            dev_fields: [],
        },
        // data file_id
        {
            type: 'data',
            name: 'file_id',
            local_number: 0,
            length: 16,
            fields: {
                time_created: 1669140872000,
                manufacturer: 1,
                product: 3570,
                serial_number: 3313379353,
                number: 0,
                type: 4,
            },
        },
        // definition file_creator
        {
            type: 'definition',
            architecture: 0,
            name: 'file_creator',
            local_number: 1,
            length: 9,
            data_record_length: 3,
            fields: [
                {number: 0, size: 2, base_type: 'uint16'},
            ],
            dev_fields: [],
        },
        // data file_creator
        {
            type: 'data',
            name: 'file_creator',
            local_number: 1,
            length: 3,
            fields: {
                software_version: 29,
            },
        },
        // definition record
        {
            type: 'definition',
            architecture: 0,
            name: 'record',
            local_number: 3,
            length: 39,
            data_record_length: 28,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'},
                {number: 0, size: 4, base_type: 'sint32'},
                {number: 1, size: 4, base_type: 'sint32'},
                {number: 2, size: 2, base_type: 'uint16'},
                {number: 3, size: 1, base_type: 'uint8'},
                {number: 4, size: 1, base_type: 'uint8'},
                {number: 5, size: 4, base_type: 'uint32'},
                {number: 6, size: 2, base_type: 'uint16'},
                {number: 7, size: 2, base_type: 'uint16'},
                {number: 9, size: 2, base_type: 'sint16'},
                {number: 62, size: 1, base_type: 'uint8'},
            ],
            dev_fields: [],
        },
        // definition hrv
        {
            type: 'definition',
            architecture: 0,
            name: 'hrv',
            local_number: 4,
            length: 9,
            data_record_length: 11,
            fields: [
                {number: 0, size: 10, base_type: 'uint16'},
            ],
            dev_fields: [],
        },
        // data record
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140869000,
                position_lat: -128450465,
                position_long: 1978610201,
                altitude: 87,
                heart_rate: 90,
                cadence: 70,
                distance: 7.66,
                speed: 6.717,
                power: 160,
                grade: 0,
                device_index: 0,
            },
        },
        // data record
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140870000,
                position_lat: -128449747,
                position_long: 1978610154,
                altitude: 87,
                heart_rate: 91,
                cadence: 71,
                distance: 14.36,
                speed: 6.781,
                power: 161,
                grade: 0,
                device_index: 0,
            },
        },
        // data record
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140871000,
                position_lat: -128449037,
                position_long: 1978609898,
                altitude: 87,
                heart_rate: 92,
                cadence: 72,
                distance: 21.34,
                speed: 7.08,
                power: 162,
                grade: 0,
                device_index: 0,
            },
        },
        // data record
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140872000,
                position_lat: -128448324,
                position_long: 1978609588,
                altitude: 87,
                heart_rate: 93,
                cadence: 73,
                distance: 28.56,
                speed: 7.498,
                power: 163,
                grade: 0,
                device_index: 0,
            },
        },
        // definition event
        {
            type: 'definition',
            architecture: 0,
            name: 'event',
            local_number: 2,
            length: 18,
            data_record_length: 8,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'},
                {number: 0, size: 1, base_type: 'enum'},
                {number: 1, size: 1, base_type: 'enum'},
                {number: 4, size: 1, base_type: 'uint8'},
            ],
            dev_fields: [],
        },
        // definition lap
        {
            type: 'definition',
            architecture: 0,
            name: 'lap',
            local_number: 5,
            length: 27,
            data_record_length: 21,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'},
                {number: 2, size: 4, base_type: 'uint32'},
                {number: 7, size: 4, base_type: 'uint32'},
                {number: 8, size: 4, base_type: 'uint32'},
                {number: 254, size: 2, base_type: 'uint16'},
                {number: 0, size: 1, base_type: 'enum'},
                {number: 1, size: 1, base_type: 'enum'},
            ],
            dev_fields: [],
        },
        // data lap
        {
            type: 'data',
            name: 'lap',
            local_number: 5,
            length: 21,
            fields: {
                timestamp: 1669140872000,
                start_time: 1669140869000,
                total_elapsed_time: 3,
                total_timer_time: 3,
                message_index: 0,
                event: 9,
                event_type: 1,
            },
        },
        // definition session
        {
            type: 'definition',
            architecture: 0,
            name: 'session',
            local_number: 6,
            length: 66,
            data_record_length: 45,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'},
                {number: 2, size: 4, base_type: 'uint32'},
                {number: 7, size: 4, base_type: 'uint32'},
                {number: 8, size: 4, base_type: 'uint32'},
                {number: 254, size: 2, base_type: 'uint16'},
                {number: 5, size: 1, base_type: 'enum'},
                {number: 6, size: 1, base_type: 'enum'},
                {number: 9, size: 4, base_type: 'uint32'},
                {number: 11, size: 2, base_type: 'uint16'},
                {number: 14, size: 2, base_type: 'uint16'},
                {number: 15, size: 2, base_type: 'uint16'},
                {number: 16, size: 1, base_type: 'uint8'},
                {number: 17, size: 1, base_type: 'uint8'},
                {number: 18, size: 1, base_type: 'uint8'},
                {number: 19, size: 1, base_type: 'uint8'},
                {number: 20, size: 2, base_type: 'uint16'},
                {number: 21, size: 2, base_type: 'uint16'},
                {number: 25, size: 2, base_type: 'uint16'},
                {number: 26, size: 2, base_type: 'uint16'},
                {number: 45, size: 2, base_type: 'uint16'},
            ],
            dev_fields: [],
        },
        // data session
        {
            type: 'data',
            name: 'session',
            local_number: 6,
            length: 45,
            fields: {
                timestamp: 1669140872000,
                start_time: 1669140869000,
                total_elapsed_time: 3,
                total_timer_time: 3,
                message_index: 0,
                sport: 2,
                sub_sport: 58,
                avg_power: 161,
                avg_cadence: 71,
                avg_speed: 7.019,
                avg_heart_rate: 91,
                max_power: 163,
                max_cadence: 73,
                max_speed: 7.498,
                max_heart_rate: 93,
                total_distance: 28.56,
                total_calories: 0,
                first_lap_index: 0,
                num_laps: 1,
                threshold_power: 200,
            },
        },
        // definition activity
        {
            type: 'definition',
            architecture: 0,
            name: 'activity',
            local_number: 7,
            length: 24,
            data_record_length: 14,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'},
                {number: 0, size: 4, base_type: 'uint32'},
                {number: 1, size: 2, base_type: 'uint16'},
                {number: 2, size: 1, base_type: 'enum'},
                {number: 3, size: 1, base_type: 'enum'},
                {number: 4, size: 1, base_type: 'enum'},
            ],
            dev_fields: [],
        },
        // data activity
        {
            type: 'data',
            name: 'activity',
            local_number: 7,
            length: 14,
            fields: {
                timestamp: 1669140872000,
                total_timer_time: 3,
                num_sessions: 1,
                type: 0,
                event: 26,
                event_type: 1,
            },
        },
        // crc
        {
            type: 'crc',
            length: 2,
            crc: fileCRC,
        },
    ];
};
// END expected FITjs



// Expected FIT binary
const fitBinary = [
    // header
    [
        14, 32, 92, 8, 171, 1, 0, 0, 46, 70, 73, 84, 99, 48,
    ],
    // definition file_id
    [
        64, 0, 0, 0, 0, 6, 4, 4, 134, 1, 2, 132, 2, 2, 132, 3,
        4, 140, 5, 2, 132, 0, 1, 0,
    ],
    // data file_id
    [
        0, 136, 197, 223, 61, 1, 0, 242, 13, 25, 40, 126, 197, 0, 0, 4,
    ],
    // definition file_creator
    [
        65, 0, 0, 49, 0, 1, 0, 2, 132,
    ],
    // data file_creator
    [
        1, 84, 11,
    ],
    // definition record
    [
        67, 0, 0, 20, 0, 11, 253, 4, 134, 0, 4, 133, 1, 4, 133, 2,
        2, 132, 3, 1, 2, 4, 1, 2, 5, 4, 134, 6, 2, 132, 7, 2,
        132, 9, 2, 131, 62, 1, 2,
    ],
    // definition hrv
    [
        68, 0, 0, 78, 0, 1, 0, 10, 132,
    ],
    // data record
    [
        3, 133, 197, 223, 61, 95, 0, 88, 248, 25, 50, 239, 117, 119, 11, 90,
        70, 254, 2, 0, 0, 61, 26, 160, 0, 0, 0, 0,
    ],
    // data record
    [
        3, 134, 197, 223, 61, 45, 3, 88, 248, 234, 49, 239, 117, 119, 11, 91,
        71, 156, 5, 0, 0, 125, 26, 161, 0, 0, 0, 0,
    ],
    // data record
    [
        3, 135, 197, 223, 61, 243, 5, 88, 248, 234, 48, 239, 117, 119, 11, 92,
        72, 86, 8, 0, 0, 168, 27, 162, 0, 0, 0, 0,
    ],
    // data record
    [
        3, 136, 197, 223, 61, 188, 8, 88, 248, 180, 47, 239, 117, 119, 11, 93,
        73, 40, 11, 0, 0, 74, 29, 163, 0, 0, 0, 0,
    ],
    // definition event
    [
        66, 0, 0, 21, 0, 4, 253, 4, 134, 0, 1, 0, 1, 1, 0, 4,
        1, 2,
    ],
    // definition lap
    [
        69, 0, 0, 19, 0, 7, 253, 4, 134, 2, 4, 134, 7, 4, 134, 8,
        4, 134, 254, 2, 132, 0, 1, 0, 1, 1, 0,
    ],
    // data lap
    [
        5, 136, 197, 223, 61, 133, 197, 223, 61, 184, 11, 0, 0, 184, 11, 0,
        0, 0, 0, 9, 1,
    ],
    // definition session
    [
        70, 0, 0, 18, 0, 20, 253, 4, 134, 2, 4, 134, 7, 4, 134, 8,
        4, 134, 254, 2, 132, 5, 1, 0, 6, 1, 0, 9, 4, 134, 11, 2,
        132, 14, 2, 132, 15, 2, 132, 16, 1, 2, 17, 1, 2, 18, 1, 2,
        19, 1, 2, 20, 2, 132, 21, 2, 132, 25, 2, 132, 26, 2, 132, 45,
        2, 132,
    ],
    // data session
    [
        6, 136, 197, 223, 61, 133, 197, 223, 61, 184, 11, 0, 0, 184, 11, 0,
        0, 0, 0, 2, 58, 40, 11, 0, 0, 0, 0, 107, 27, 74, 29, 91,
        93, 71, 73, 161, 0, 163, 0, 0, 0, 1, 0, 200, 0,
    ],
    // definition activity
    [
        71, 0, 0, 34, 0, 6, 253, 4, 134, 0, 4, 134, 1, 2, 132, 2,
        1, 0, 3, 1, 0, 4, 1, 0,
    ],
    // data activity
    [
        7, 136, 197, 223, 61, 184, 11, 0, 0, 1, 0, 0, 26, 1,
    ],
    // crc
    [
        163, 109,
    ],
];

const flatFitBinary = fitBinary.flat();
// END Expected FIT binary

export {
    appData,
    FITjs,
    fitBinary,
    flatFitBinary,
};

