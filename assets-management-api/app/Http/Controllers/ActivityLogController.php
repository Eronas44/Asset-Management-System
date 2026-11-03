<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Http\Resources\ActivityLogResource;

class ActivityLogController extends Controller
{
         /**
     * @OA\Get(
     *      path="/api/activity-logs",
     *      operationId="getActivityLogsList",
     *      tags={"Activity Logs"},
     *      summary="Jejak Audit Trail Sistem",
     *      description="Mengambil rekaman kronologis aktivitas penting internal sistem keamanan aplikasi terpaginasi.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Sukses memuat lembar audit trail")
     * )
     */

    public function index(Request $request)
    {
        $filters = $request->only(['action', 'user_id', 'date_from', 'date_to']);
        $perPage = max(1, min(100, (int) $request->input('per_page', 10)));

        $logs = ActivityLog::with('user')
            ->filter($filters)
            ->latest('id') // Diurutkan berdasarkan ID log terbaru
            ->paginate($perPage);

        return ActivityLogResource::collection($logs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ActivityLog $activityLog)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ActivityLog $activityLog)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ActivityLog $activityLog)
    {
        //
    }
}
