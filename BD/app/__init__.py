from flask import Flask, g
from .models import init_db

def create_app():
    app = Flask(__name__)
    app.config['DATABASE'] = 'tanks.db'
    
    with app.app_context():
        init_db()

    from .controllers import bp as main_bp
    app.register_blueprint(main_bp)

    @app.teardown_appcontext
    def close_db(error):
        if 'db' in g:
            g.pop('db').close()
    
    return app