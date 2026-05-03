<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->proprietaire->notifications();

        if (!$request->boolean('toutes')) {
            $query->where('est_lue', false);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        $this->authorizeOwnershipOrFail($request, $notification);

        $notification->update([
            'est_lue' => true,
            'lue_le' => now(),
        ]);

        return $notification;
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->proprietaire->notifications()
            ->where('est_lue', false)
            ->update(['est_lue' => true, 'lue_le' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont ete marquees comme lues.']);
    }

    public function destroy(Request $request, Notification $notification)
    {
        $this->authorizeOwnershipOrFail($request, $notification);
        $notification->delete();
        return response()->noContent();
    }
}
