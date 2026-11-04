import { NextRequest, NextResponse } from 'next/server';
import { getContacts, getTenant } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || undefined;

    const contacts = await getContacts(tenantId);
    let tenantName = 'All Workspaces';
    if (tenantId) {
      const t = await getTenant(tenantId);
      if (t) tenantName = t.name;
    }

    // Headers for Excel / CSV
    const csvHeaders = [
      'Customer Name',
      'WhatsApp Phone',
      'Status',
      'Bot Mode',
      'Needs Human Assistance',
      'Unread Messages',
      'Assigned Agent',
      'Tags',
      'Business / Workspace',
      'First Contact Date',
      'Last Message At',
      'Notes',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = contacts.map((c) => [
      escapeCsv(c.name || 'Unnamed Client'),
      escapeCsv(c.phone ? `+${c.phone.replace(/\D/g, '')}` : ''),
      escapeCsv(c.status || 'active'),
      escapeCsv(c.mode === 'ai_chatbot' ? 'Gemini AI Autopilot' : 'Automated Template'),
      escapeCsv(c.needsHumanAssistance ? 'YES (Human Support Needed)' : 'NO'),
      escapeCsv(c.unreadCount || 0),
      escapeCsv(c.assignedAgent || 'Unassigned'),
      escapeCsv((c.tags || []).join('; ')),
      escapeCsv(tenantName),
      escapeCsv(c.createdAt ? new Date(c.createdAt).toLocaleString('en-US') : ''),
      escapeCsv(c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString('en-US') : ''),
      escapeCsv(c.notes || ''),
    ]);

    // Prepend UTF-8 BOM for Microsoft Excel compatibility
    const csvContent =
      '\uFEFF' +
      [csvHeaders.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const cleanDate = new Date().toISOString().split('T')[0];
    const fileName = `whatsapp-customers-${(tenantName || 'export').toLowerCase().replace(/[^a-z0-9]/g, '_')}-${cleanDate}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    console.error('Contacts export error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to export customer data.' },
      { status: 500 }
    );
  }
}
