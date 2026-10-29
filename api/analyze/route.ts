import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const home = String(body.home ?? "").trim();
    const away = String(body.away ?? "").trim();

    const homeOdds = Number(body.homeOdds);
    const drawOdds = Number(body.drawOdds);
    const awayOdds = Number(body.awayOdds);

    if (
      !home ||
      !away ||
      !Number.isFinite(homeOdds) ||
      !Number.isFinite(drawOdds) ||
      !Number.isFinite(awayOdds) ||
      homeOdds <= 1 ||
      drawOdds <= 1 ||
      awayOdds <= 1
    ) {
      return NextResponse.json(
        { error: "Enter both team names and valid odds greater than 1." },
        { status: 400 }
      );
    }

    const h = 1 / homeOdds;
    const d = 1 / drawOdds;
    const a = 1 / awayOdds;
    const total = h + d + a;

    return NextResponse.json({
      home,
      away,
      probabilities: {
        home: (h / total) * 100,
        draw: (d / total) * 100,
        away: (a / total) * 100,
      },
      overround: (total - 1) * 100,
      note:
        "These percentages are calculated from the odds entered. They are not guaranteed predictions of virtual football results.",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }
}
