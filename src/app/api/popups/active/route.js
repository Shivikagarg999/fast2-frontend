import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch active popup from the backend API
    const response = await fetch('http://localhost:5000/api/popups/active', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache to always get latest popup
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: null },
        { status: 404 }
      );
    }

    const data = await response.json();

    // Validate response structure
    if (data.success && data.data) {
      const popup = data.data;

      // Check if popup is active based on time window
      const now = new Date();
      const startTime = new Date(popup.startTime);
      const endTime = new Date(popup.endTime);

      const isWithinTimeWindow = now >= startTime && now <= endTime;
      const isPopupActive = popup.isActive && isWithinTimeWindow;

      if (isPopupActive) {
        return NextResponse.json(
          { success: true, data: popup },
          { status: 200 }
        );
      }
    }

    // No active popup
    return NextResponse.json(
      { success: true, data: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching active popup:', error);
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: 500 }
    );
  }
}
