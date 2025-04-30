# Gestión de Migraciones de Base de Datos

Este proyecto utiliza [Alembic](https://alembic.sqlalchemy.org/) para gestionar las migraciones de la base de datos.
Para facilitar su uso, se ha creado un script `manage_migrations.py` que simplifica las operaciones más comunes.

## Requisitos

- Python 3.10+
- Alembic
- SQLAlchemy

Estos requisitos ya están incluidos en el archivo `requirements.txt`.

## Comandos Disponibles

### Crear una Nueva Migración

Para crear una nueva migración cuando hayas realizado cambios en los modelos:

```bash
python manage_migrations.py create "Descripción de los cambios"
```

Esto generará automáticamente un archivo de migración en `migrations/versions/`.

### Aplicar Migraciones Pendientes

Para aplicar todas las migraciones pendientes:

```bash
python manage_migrations.py upgrade
```

### Revertir la Última Migración

Si necesitas deshacer la última migración aplicada:

```bash
python manage_migrations.py rollback
```

### Ver el Historial de Migraciones

Para ver todas las migraciones disponibles y su estado:

```bash
python manage_migrations.py history
```

### Ver la Versión Actual

Para ver la revisión actual de la base de datos:

```bash
python manage_migrations.py current
```

## Flujo de Trabajo Recomendado

1. Realiza cambios en los modelos de datos (archivos en `app/models/`)
2. Crea una nueva migración: `python manage_migrations.py create "Descripción de los cambios"`
3. Revisa el archivo de migración generado en `migrations/versions/` para confirmar que los cambios son correctos
4. Aplica la migración: `python manage_migrations.py upgrade`
5. Verifica que todo funciona correctamente

Si hay algún problema, puedes revertir la última migración con `python manage_migrations.py rollback`.

## Primer Uso

Cuando configures el proyecto por primera vez, necesitarás crear y aplicar la migración inicial:

```bash
# Crear la migración inicial
python manage_migrations.py create "Migración inicial"

# Aplicar la migración
python manage_migrations.py upgrade
```

## Notas Importantes

- Siempre revisa las migraciones generadas automáticamente antes de aplicarlas.
- Haz commit de los archivos de migración junto con los cambios en el código.
- Si trabajas en equipo, coordina las migraciones para evitar conflictos.
- Las migraciones son secuenciales; no puedes aplicar una migración si hay otra pendiente anterior.

## Solución de Problemas

### Error "Target database is not up to date"

Si recibes este error al crear una nueva migración, significa que hay migraciones pendientes por aplicar:

```bash
python manage_migrations.py upgrade
```

### Error "Can't locate revision"

Si no se puede encontrar una revisión referenciada, puede ser necesario corregir manualmente el historial:

```bash
# Ver la revisión actual
python manage_migrations.py current

# Aplicar una revisión específica
alembic upgrade <revision_id>
```
