import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Validates the vehicle license plate format dynamically
 */
const RequestSchema = z.object({
  licensePlate: z.string().min(4).max(15)
});

/**
 * Handles VAHAN API mock validation for vehicle license plates.
 * Returns simulated vehicle registration details used for downstream AI cross-referencing.
 * 
 * @param req Incoming HTTP Request
 * @returns JSON Response containing the extracted mock VAHAN record
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { licensePlate } = RequestSchema.parse(body);

    // Simulated VAHAN Database Response
    // Provides dummy data based on the license plate format
    const mockData = {
      licensePlate: licensePlate.toUpperCase(),
      ownerName: "Rahul Sharma",
      vehicleModel: "Maruti Suzuki Swift VXI",
      registrationDate: "2023-05-12",
      insuranceStatus: "ACTIVE",
      insurer: "Dummy General Insurance Co.",
      fitnessValidUpto: "2038-05-11"
    };

    return NextResponse.json({ success: true, data: mockData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request payload or malformed license plate" }, 
      { status: 400 }
    );
  }
}
