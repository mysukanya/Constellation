import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.sqlite_client import init_sqlite_db
from app.dependencies import create_initial_users
from app.db.neo4j_client import graph_client
from app.routers import (
    auth, cases, entities, relationships,
    ingestion, entity_resolution, evidence, byomkesh, audit,
    home, hypotheses, sweep
)
from app.routers import workspaces, notifications

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s | %(name)-30s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("constellation")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # 1. Initialize SQLite tables (users, audit ledger, ER matches, evidence, workspaces, notifications)
    init_sqlite_db()
    logger.info("SQLite database initialized")

    # 2. Seed initial users (admin, investigator, analyst)
    create_initial_users()
    logger.info("Default users seeded")

    # 3. Connect to Graph (Neo4j with resilient fallback)
    await graph_client.connect()
    logger.info(f"Graph engine: {'Neo4j' if graph_client.is_connected else 'Embedded Resilience Engine'}")

    # 4. Seed Canonical Intelligence (Case 102, 117, 143 entities & edges)
    from app.db.seed_data import seed_canonical_intelligence
    await seed_canonical_intelligence()
    logger.info("Canonical intelligence seeded")

    # 5. Start the Autonomous Sweep Scheduler (APScheduler)
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from app.services.sweep_service import sweep_service

    scheduler = AsyncIOScheduler()
    sweep_hours = settings.SWEEP_INTERVAL_HOURS

    async def scheduled_sweep():
        logger.info("Autonomous sweep triggered by scheduler")
        try:
            summary = await sweep_service.execute_sweep(triggered_by="apscheduler_cron")
            logger.info(
                f"Sweep {summary.sweep_id} completed: "
                f"{summary.findings_count} findings across {summary.cases_scanned_count} cases "
                f"({summary.duration_ms}ms)"
            )
        except Exception as e:
            logger.error(f"Scheduled sweep failed: {e}", exc_info=True)

    scheduler.add_job(
        scheduled_sweep,
        trigger="interval",
        hours=sweep_hours,
        id="autonomous_sweep",
        name=f"Autonomous Intelligence Sweep (every {sweep_hours}h)",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"Autonomous sweep scheduler started (interval: {sweep_hours}h)")

    logger.info(f"Backend ready at http://0.0.0.0:8000")
    logger.info(f"API docs at http://localhost:8000/docs")
    
    yield
    
    # Graceful shutdown
    scheduler.shutdown(wait=False)
    logger.info("Sweep scheduler shut down")
    await graph_client.close()
    logger.info("Backend shutdown complete")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-agent, multi-layer investigative intelligence platform",
    lifespan=lifespan
)

# ---- Production Middleware ----

# CORS configuration (env-configurable)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list if not settings.DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    elapsed = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({elapsed}ms)")
    return response

# ---- API Routers ----
app.include_router(auth.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(relationships.router, prefix="/api")
app.include_router(ingestion.router, prefix="/api")
app.include_router(entity_resolution.router, prefix="/api")
app.include_router(evidence.router, prefix="/api")
app.include_router(byomkesh.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(home.router, prefix="/api")
app.include_router(hypotheses.router, prefix="/api")
app.include_router(sweep.router, prefix="/api")
app.include_router(workspaces.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "graph_backend": "Neo4j" if graph_client.is_connected else "Embedded Resilience Engine",
        "llm_configured": bool(settings.NVIDIA_API_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
